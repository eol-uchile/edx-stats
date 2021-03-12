import logging
import pytz
from datetime import timedelta, datetime, date
import pandas as pd
from django.conf import settings
from django.db import transaction
from celery import shared_task
from core.models import Log, CourseVertical, StaffUserName
from visits.models import VisitOnPage
from core.processing import read_json_course, read_json_course_file, \
    flatten_course_as_verticals, read_logs, filter_by_log_qty, filter_course_team, \
    load_course_blocks_from_LMS
from core.classifier import LogParser

logger = logging.getLogger(__name__)
DAY_WINDOW = timedelta(days=3)
BULK_UPLOAD_SIZE = 500


@shared_task
def process_visit_count(end_date, day_window=None, run_code=None):
    """Recovers logs from DB and computes visits per day for each vertical

    Computes visits for each day until the end date given a day window.
    Default Day window is DAY_WINDOW (3 days).

    Note: Celery will set end_date as datetime.datetime.now()
    Timezone localization will be set according to settings.py

    Arguments
    - end_date datetime to use and upper date limit,
        lower date limit is set as end_date - DAY_WINDOW.
        If none is provided all logs will be processed
    - day_window timedelta to subtract from end_date.
        If none is provided default DAY_WINDOW is used

    """

    def make_row(row, date):
        visit_on_page = VisitOnPage(
            vertical=row["vertical"],
            sequential=row["sequential"],
            chapter=row["chapter"],
            course=row["course"],
            username=row["username"],
            count=row["visits"],
            time=date)
        return visit_on_page

    def save_vertical_row(row):
        vertical = CourseVertical(
            course=row["course"],
            course_name=row["course_name"],
            chapter=row["chapter"],
            chapter_name=row["chapter_name"],
            sequential=row["sequential"],
            sequential_name=row["sequential_name"],
            vertical=row["vertical"],
            vertical_name=row["vertical_name"],
            block_id=row["id"],
            vertical_number=row["vertical_number"],
            sequential_number=row["sequential_number"],
            chapter_number=row["chapter_number"],
            child_number=row["child_number"],
            block_type=row["type"],
            student_view_url=row["student_view_url"],
            lms_web_url=row["lms_web_url"])
        vertical.save()

    # Get all course ids for the required date
    time_window = DAY_WINDOW if day_window is None else day_window
    tz = pytz.timezone(settings.TIME_ZONE)
    end_date_localized = None if end_date is None else tz.localize(end_date)

    if end_date_localized is None:
        course_ids_db = Log.objects.all().values("course_id").distinct()
    else:
        course_ids_db = Log.objects.filter(time__gte=(
            end_date_localized - time_window), time__lt=(end_date_localized)).values("course_id").distinct()

    if course_ids_db.first() is None:
        logger.info("No logs for time processing")
        return

    # Staff users
    staff_users = StaffUserName.objects.all()
    
    # Create subsets for each course
    # and update the Processed log if any was successful
    for course_dict in course_ids_db:
        course_id = course_dict["course_id"]
        if course_id == '':
            continue
        try:
            recovered_blocks = load_course_blocks_from_LMS(
                "{}+type@course+block@course".format(course_id.replace('course-v1', 'block-v1')))
        except Exception as e:
            logger.warning("Failed to load {} form LMS".format(e), exc_info=True)
            continue
        course_blocks = read_json_course(recovered_blocks)
        course_dataframe = flatten_course_as_verticals(course_blocks)

        # If no valid verticals were found abort
        count, _ = course_dataframe.shape
        if count == 0:
            logger.warning(
                "Course {} was either empty or an error ocurred".format(course_id))
            continue

        # Remove previous course info in the DB
        course_id_df = course_dataframe['course'].iloc[0]
        previous_values = CourseVertical.objects.filter(course=course_id_df)
        if len(previous_values) != 0:
            previous_values.delete()
        # Update vertical information on DB
        course_dataframe.apply(save_vertical_row, axis=1)

        # This course
        if end_date is None:
            course_logs = Log.objects.filter(course_id=course_id).values('username', 'event_type', 'name', 'referer', 'time', 'event', 'course_id', 'org_id', 'user_id', 'path')
        else:
            course_logs = Log.objects.filter(time__gte=(
                end_date_localized - time_window), time__lt=(end_date_localized),course_id=course_id).values('username', 'event_type', 'name', 'referer', 'time', 'event', 'course_id', 'org_id', 'user_id', 'path')

        logs_full = pd.DataFrame(course_logs)

        # Get staff users to ban from stats
        users = [u.username for u in staff_users]
        logs = filter_course_team(logs_full, other_people=users)
        del logs_full # Save memory on run
        logs = filter_by_log_qty(logs, min_logs=15)

        # Create time windows and process for each period
        periods = pd.date_range(start=end_date_localized - time_window,
                                end=end_date_localized, freq=timedelta(days=1), tz=settings.TIME_ZONE)
        for period in periods:

            day_logs = logs[logs.time.dt.date == period]
            # Continue if no logs exists
            count, _ = day_logs.shape
            if count == 0:
                continue
            try:
                # Parse and process time values
                parser = LogParser(df=course_dataframe, run_code=run_code)
                parser.load_logs(day_logs)
                parsed_logs = parser.parse_and_get_logs()

                # CLASSIFIER PART
                # Note: we could remove each iteration of indexes
                # to reduce memory usage as we go
                cet = 'classification_event_type'
                condition = (parsed_logs[cet] == 'next_vertical') | \
                    (parsed_logs[cet] == 'next_sequence_first_vertical') | \
                    (parsed_logs[cet] == 'previous_vertical') | \
                    (parsed_logs[cet] == 'previous_sequence_last_vertical') | \
                    (parsed_logs[cet] == 'goto_vertical')
                navigation_logs = parsed_logs[condition]
                navigation_logs_cleaned = navigation_logs[
                    navigation_logs['event_type_vertical'] != 'NO_VERTICAL_FOUND']
                del navigation_logs
                user_vertical_visits = navigation_logs_cleaned \
                    .groupby(['username', 'event_type_vertical']) \
                    .event_type_vertical.agg('count') \
                    .to_frame('visits') \
                    .reset_index()
                del navigation_logs_cleaned
                merged_sequential_visits = user_vertical_visits \
                    .rename(columns={"event_type_vertical": "vertical"}) \
                    .merge(course_dataframe, on='vertical')
                del user_vertical_visits

                with transaction.atomic():
                    # Delete today's info to overwrite
                    previous_visits = VisitOnPage.objects.filter(
                        time__date=period, course=course_dataframe["course"][0])
                    previous_visits.delete()

                    # Upload bulks to DB
                    count, _ = merged_sequential_visits.shape
                    for i in range(0, count, BULK_UPLOAD_SIZE):
                        bulk = merged_sequential_visits[i:i+BULK_UPLOAD_SIZE]
                        visits = list(bulk.apply(
                            lambda row: make_row(row, period), axis=1))
                        VisitOnPage.objects.bulk_create(visits)

                    logger.info("Course {} visits processed for {}".format(
                        course_id, period))
                        
            except Exception as error:
                logger.warning("Failed to process visits on {}, {}. Reason: {}".format(
                    course_id, period, str(error)), exc_info=True)


def compute_visit_batches(initial_date=None, time_delta=timedelta(days=3), final_date=None):
    """
    Process all visits by batches from initial_date to today

    Arguments
    - initial_date string like 2018-09-24

    - time_delta timedelta object
    """
    end = datetime.today()
    if final_date is not None:
        end = final_date
    times = pd.date_range(
        start=initial_date, end=end, freq=time_delta)
    run_code = str(date.today())

    for i in range(1, len(times)):
        logger.info("Processing visit logs for time {} with offset {}".format(
            times[i], time_delta))
        # This is a pandas timestamp Timestamp class, it should be replaced with datetime for a more
        # standard module
        process_visit_count(times[i], time_delta, run_code=run_code)
    logger.info("Finished processing visits")