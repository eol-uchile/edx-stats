import logging
import pytz
from datetime import timedelta, datetime, date
import pandas as pd
from django.conf import settings
from django.db import transaction
from celery import shared_task
from core.models import Log, CourseVertical, StaffUserName
from times.models import TimeOnPage as TimeModel
from core.processing import read_json_course, read_json_course_file, \
    flatten_course_as_verticals, read_logs, filter_by_log_qty, filter_course_team, \
    load_course_blocks_from_LMS
from core.classifier import LogParser
from times.classifier import TimeOnPage

logger = logging.getLogger(__name__)
TIMEOUT = timedelta(minutes=10)
DAY_WINDOW = timedelta(days=3)
COMPUTE_LOWER_LIMIT = timedelta(seconds=15)
BULK_UPLOAD_SIZE = 500


@shared_task
def process_log_times(end_date=None, day_window=None, run_code=None):
    """Recovers logs from DB and computes time per session

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
    - run_code to save errors on a single file with the same code

    """
    def make_row(row, date, course):
        delta = row["delta_time"].days*84600 + row["delta_time"].seconds
        time_on_page = TimeModel(
            session=row["session"],
            username=row["username"],
            delta_time_float=delta,
            event_type_vertical=row["vertical_id"],
            course=course,
            time=date)
        return time_on_page

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

    # Recover logs:
    # Process using end_date as upper limit. If none is given process all logs
    # Parse to json
    time_window = DAY_WINDOW if day_window is None else day_window
    tz = pytz.timezone(settings.TIME_ZONE)
    end_date_localized = None if end_date is None else tz.localize(end_date)
    # Get all course ids for the required date
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
        
        #course_dataframe.to_csv("text.csv")

        # Remove previous course info in the DB
        course_id_df = course_dataframe['course'].iloc[0]
        previous_values = CourseVertical.objects.filter(course=course_id_df)
        if len(previous_values) != 0:
            previous_values.delete()
        # Update vertical information on DB
        course_dataframe.apply(save_vertical_row, axis=1)

        # This course
        if end_date is None:
            course_logs = Log.objects.filter(course_id=course_id).values('username', 'event_type', 'name', 'referer', 'time', 'event', 'course_id', 'org_id', 'user_id', 'path', 'page')
        else:
            course_logs = Log.objects.filter(time__gte=(
                end_date_localized - time_window), time__lt=(end_date_localized),course_id=course_id).values('username', 'event_type', 'name', 'referer', 'time', 'event', 'course_id', 'org_id', 'user_id', 'path', 'page')

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
                parser.load_logs(day_logs) # Create log copy and modify
                del day_logs # Free old value
                parsed_logs = parser.parse_and_get_logs() # Recover log reference
                timer = TimeOnPage(
                    timeout_last_action=TIMEOUT,
                    timeout_outlier=TIMEOUT,
                    navigation_time=COMPUTE_LOWER_LIMIT)
                timer.load_logs(parsed_logs) # Create log copy and modify
                del parsed_logs # Free old value
                timer.do_user_time_session()
                timer.do_time_on_page(
                    apply_outlier_timeout=True,
                    apply_navigation_lower_limit=True)

                # Clean and recover only times on valid verticals
                timer.clean_time_on_page_logs()
                time_per_user_session = timer.time_on_page.copy()
                time_per_user_session = time_per_user_session[
                    time_per_user_session['vertical_id'] != 'NOT_LISTED']

                # Delete today's info to overwrite
                with transaction.atomic():
                    previous_times = TimeModel.objects.filter(
                        time__date=period, course=course_dataframe["course"][0])
                    previous_times.delete()

                    # Upload bulks to DB
                    count, _ = time_per_user_session.shape
                    for i in range(0, count, BULK_UPLOAD_SIZE):
                        bulk = time_per_user_session[i:i+BULK_UPLOAD_SIZE]
                        times = list(bulk.apply(lambda row: make_row(
                            row, period, course_dataframe["course"][0]), axis=1))
                        TimeModel.objects.bulk_create(times)

                    logger.info("Course {} times processed for {}".format(
                        course_id, period))
                        
            except Exception as error:
                logger.warning("Failed to process times on {}, {}. Reason: {}".format(
                    course_id, period, error), exc_info=True)


def process_log_times_from_dir(logpath, coursepath, zipped=True):
    """OLD: Read log files and process times for a single course locally

    NOTE: Only meant for development

    Arguments:
    - logpath String path to log file
    - coursepath String path to course file
    - zipped Bool if logfile is zipped

    """
    def save_row(row):
        delta = row["delta_time"].days*84600 + row["delta_time"].seconds
        time_on_page = TimeModel(
            session=row["session"],
            username=row["username"],
            delta_time_float=delta,
            event_type_vertical=row["event_type_vertical"],
            course=row["course"])
        time_on_page.save()

    logs_full = read_logs(logpath, zipped)
    logs = filter_course_team(logs_full, other_people=[
        'gap', 'francisco_sereno'])
    logs = filter_by_log_qty(logs, min_logs=15)
    with open(coursepath) as f:
        course_blocks = read_json_course_file(f)
    dataframe = flatten_course_as_verticals(course_blocks)
    parser = LogParser(df=dataframe)
    parser.load_logs(logs)
    parsed_logs = parser.parse_and_get_logs()
    timer = TimeOnPage(
        timeout_last_action=TIMEOUT,
        timeout_outlier=TIMEOUT,
        navigation_time=COMPUTE_LOWER_LIMIT)
    timer.load_logs(parsed_logs)
    timer.do_user_time_session()
    timer.do_time_on_page(
        apply_outlier_timeout=True,
        apply_navigation_lower_limit=True)
    time_per_user_session = timer.time_on_page.copy()
    time_per_user_session["course"] = dataframe["course"][0]
    time_per_user_session.apply(save_row, axis=1)


def compute_time_batches(initialDate=None, time_delta=timedelta(days=3),final_date=None):
    """
    Process all log times by batches from initialDate to today

    Arguments
    - initialDate string like 2018-09-24

    - time_delta timedelta object
    """
    end = datetime.today()
    if final_date is not None:
        end = final_date
    times = pd.date_range(
        start=initialDate, end=end, freq=time_delta)
    run_code = str(date.today())

    for i in range(1, len(times)):
        logger.info("Processing time logs for time {} with offset {}".format(
            times[i], time_delta))
        # This is a pandas timestamp Timestamp class, it should be replaced with datetime for a more
        # standard module
        process_log_times(times[i], time_delta, run_code=run_code)
    logger.info("Finished processing time on logs")