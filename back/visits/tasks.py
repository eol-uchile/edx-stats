import logging
import pytz
from datetime import timedelta, datetime
import pandas as pd
from django.conf import settings
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
def process_visit_count(end_date, day_window=None):
    """Recovers logs from DB and computes visits per day for each vertical

    Computes times for each day until the end date given a day window.
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

    time_window = DAY_WINDOW if day_window is None else day_window
    if end_date is None:
        logs_db = Log.objects.all()
    else:
        tz = pytz.timezone(settings.TIME_ZONE)
        end_date_localized = tz.localize(end_date)
        logs_db = Log.objects.filter(time__gte=(
            end_date_localized - time_window), time__lt=(end_date_localized))

    if logs_db.first() is None:
        logger.info("No logs for time processing")
        return
    logs_full = pd.DataFrame(logs_db.values())

    # Get staff users to ban from stats
    users = [u.username for u in StaffUserName.objects.all()]
    logs = filter_course_team(logs_full, other_people=users)
    logs = filter_by_log_qty(logs, min_logs=15)

    # Drop elements without course_id
    logs = logs[logs['course_id'] != '']
    course_ids = set(logs['course_id'].values)

    # Create subsets for each course
    # and update the Processed log if any was successful
    for course_id in course_ids:
        try:
            recovered_blocks = load_course_blocks_from_LMS(
                "{}+type@course+block@course".format(course_id.replace('course-v1', 'block-v1')))
            course_blocks = read_json_course(recovered_blocks)
            course_dataframe = flatten_course_as_verticals(course_blocks)
        except Exception as e:
            print("Error while loading course structure", e)
            logger.warning(
                "Course {} times not processed due to {}".format(course_id, e), exc_info=True)
            continue

        # If no valid verticals were found abort
        count, _ = course_dataframe.shape
        if count == 0:
            continue

        # Remove previous course info in the DB
        course_id_df = course_dataframe['course'].iloc[0]
        previous_values = CourseVertical.objects.filter(course=course_id_df)
        if len(previous_values) != 0:
            previous_values.delete()
        # Update vertical information on DB
        course_dataframe.apply(save_vertical_row, axis=1)

        # This course
        course_logs = logs[logs['course_id'] == course_id]

        # Create time windows and process for each period
        periods = pd.date_range(start=end_date_localized - time_window,
                                end=end_date_localized, freq=timedelta(days=1), tz=settings.TIME_ZONE)
        for period in periods:

            day_logs = course_logs[course_logs.time.dt.date == period]
            # Continue if no logs exists
            count, _ = day_logs.shape
            if count == 0:
                continue
            try:
                # Parse and process time values
                parser = LogParser(df=course_dataframe)
                parser.load_logs(day_logs)
                parsed_logs = parser.parse_and_get_logs()

                # CLASSIFIER PART
                cet = 'classification_event_type'
                condition = (parsed_logs[cet] == 'next_vertical') | \
                    (parsed_logs[cet] == 'next_sequence_first_vertical') | \
                    (parsed_logs[cet] == 'previous_vertical') | \
                    (parsed_logs[cet] == 'previous_sequence_last_vertical') | \
                    (parsed_logs[cet] == 'goto_vertical')
                navigation_logs = parsed_logs[condition]
                navigation_logs_cleaned = navigation_logs[
                    navigation_logs['event_type_vertical'] != 'NO_VERTICAL_FOUND']
                user_vertical_visits = navigation_logs_cleaned \
                    .groupby(['username', 'event_type_vertical']) \
                    .event_type_vertical.agg('count') \
                    .to_frame('visits') \
                    .reset_index()
                merged_sequential_visits = user_vertical_visits \
                    .rename(columns={"event_type_vertical": "vertical"}) \
                    .merge(course_dataframe, on='vertical')

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


def compute_visit_batches(initial_date=None, time_delta=timedelta(days=3)):
    """
    Process all visits by batches from initial_date to today

    Arguments
    - initial_date string like 2018-09-24

    - time_delta timedelta object
    """
    times = pd.date_range(
        start=initial_date, end=datetime.today(), freq=time_delta)
    for i in range(1, len(times)):
        logger.info("Processing time logs for time {} with offset {}".format(
            times[i], time_delta))
        # This is a pandas timestamp Timestamp class, it should be replaced with datetime for a more
        # standard module
        process_visit_count(times[i], time_delta)
    logger.info("Finished processing visits")