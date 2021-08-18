import logging
from datetime import timedelta, datetime, date
import pandas as pd
from django.conf import settings
from django.db import transaction
from celery import shared_task
from core.models import Log, CourseVertical, StaffUserName
from core.processing import read_json_course_file, \
    flatten_course_as_verticals, read_logs, filter_by_log_qty, filter_course_team
from core.classifier import LogParser
from core.tasks import process_logs_standard_procedure, process_logs_single_course
from times.models import TimeOnPage as TimeModel
from times.classifier import TimeOnPage


logger = logging.getLogger(__name__)
TIMEOUT = timedelta(minutes=10)
DAY_WINDOW = timedelta(days=3)
COMPUTE_LOWER_LIMIT = timedelta(seconds=15)
BULK_UPLOAD_SIZE = 500


@shared_task
def process_log_times(end_date=None, day_window=None, run_code=None, course=None):
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
    - course if only one course is to be processed

    """
    def make_row(row, date, course):
        delta = row["delta_time"].days*84600 + row["delta_time"].seconds
        vertical_to_associate = CourseVertical.objects.filter(
            vertical__icontains=row["vertical_id"], 
            course__icontains=course  
        ).first()
        time_on_page = TimeModel(
            vertical = vertical_to_associate,
            session=row["session"],
            username=row["username"],
            delta_time_float=delta,
            time=date)
        return time_on_page

    def process_times(dataframe, course_df, date, course_id, code):
        # Parse and process time values
        parser = LogParser(df=course_df, run_code=run_code)
        parser.load_logs(dataframe)  # Create log copy and modify
        parsed_logs = parser.parse_and_get_logs()  # Recover log reference
        timer = TimeOnPage(
            timeout_last_action=TIMEOUT,
            timeout_outlier=TIMEOUT,
            navigation_time=COMPUTE_LOWER_LIMIT)
        timer.load_logs(parsed_logs)  # Create log copy and modify
        del parsed_logs  # Free old value
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
                time__date=date, vertical__course=course_df["course"][0])
            previous_times.delete()

            # Upload bulks to DB
            count, _ = time_per_user_session.shape
            for i in range(0, count, BULK_UPLOAD_SIZE):
                bulk = time_per_user_session[i:i+BULK_UPLOAD_SIZE]
                times = list(bulk.apply(lambda row: make_row(
                    row, date, course_df["course"][0]), axis=1))
                TimeModel.objects.bulk_create(times)

            logger.info("Course {}, {} times processed for {}".format(
                course_id, count, date))

    if course is not None:
        process_logs_single_course(
            process_times, "times", course, end_date, day_window, run_code)
    else:
        process_logs_standard_procedure(
            process_times, "times", end_date, day_window, run_code)


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
        vertical_to_associate = CourseVertical.objects.filter(
            vertical__icontains=row["event_type_vertical"], 
            course__icontains=row["course"],  
        ).first()
        time_on_page = TimeModel(
            vertical=vertical_to_associate,
            session=row["session"],
            username=row["username"],
            delta_time_float=delta,
        )
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


def compute_time_batches(initialDate=None, time_delta=timedelta(days=3), final_date=None, course=None):
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
        process_log_times(times[i], time_delta,
                          run_code=run_code, course=course)
    logger.info("Finished processing time on logs")
