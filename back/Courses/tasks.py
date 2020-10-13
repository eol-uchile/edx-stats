import math
import pandas as pd
import os
import logging
from datetime import timedelta
from celery import shared_task
from Courses.models import Log, CourseVertical, TimeOnPage as TimeModel, StaffUserName, ProcessedRecord
from Courses.processing import read_json_course, read_json_course_file, \
    flatten_course_as_verticals, read_logs, filter_by_log_qty, filter_course_team, \
    load_course_from_LMS
from Courses.classifier import LogParser, TimeOnPage
from django.conf import settings
from django.core.serializers import json as django_json_serializer

logger = logging.getLogger(__name__)
TIMEOUT = timedelta(minutes=10)
LOWER_LIMIT = timedelta(seconds=15)  # files
BULK_UPLOAD_SIZE = 500

@shared_task
def load_course(filepath):
    """Load course structure from filesystem

    Arguments:
    - filepath String
    """
    course_blocks = read_json_course_file(filepath)
    dataframe = flatten_course_as_verticals(course_blocks)

    def save_row(row):
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
    # Remove previous course info in the DB
    course_id = dataframe['course'].iloc[0]
    previous_values = CourseVertical.objects.filter(course=course_id)
    if len(previous_values) != 0:
        previous_values.delete()
    dataframe.apply(save_row, axis=1)
    logger.info("Loaded course verticals for {}".format(course_code))

@shared_task
def load_course_from_api(course_code):
    """Load course structure from LMS API

    Arguments:
    - course_code String as block-v1:course_name+type@course+block@course
    """
    try:
        json_text = load_course_from_LMS(course_code)
    except Exception as e:
        # Abort processing
        logger.warning(e)
        return
    course_blocks = read_json_course(json_text)
    dataframe = flatten_course_as_verticals(course_blocks)

    def save_row(row):
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

    # Remove previous course info in the DB
    course_id = dataframe['course'].iloc[0]
    previous_values = CourseVertical.objects.filter(course=course_id)
    if len(previous_values) != 0:
        previous_values.delete()

    dataframe.apply(save_row, axis=1)
    logger.info("Loaded course verticals for {}".format(course_code))

@shared_task
def load_logs(dirpath=settings.BACKEND_LOGS_DIR, zipped=True):
    """Loads logs from filesystem by scanning the directory

    Reads each file and loads it to the DB. If the operation fails
    it moves the file to a discarted directory. Finally it removes the
    file.

    Arguments:
    - dirpath String for directory
    """
    def make_row(row):
        user_id = 0 if math.isnan(
            row["context.user_id"]) else row["context.user_id"]
        log = Log(
            username=row["username"],
            event_source=row["event_source"],
            name=row["name"],
            accept_language=row["accept_language"],
            ip=row["ip"],
            agent=row["agent"],
            page=row["page"],
            host=row["host"],
            session=row["session"],
            referer=row["referer"],
            time=row["time"],
            event=row["event"],
            event_type=row["event_type"],
            course_id=row["context.course_id"],
            org_id=row["context.org_id"],
            user_id=user_id,
            path=row["context.path"])
        return log

    files = [f for f in os.listdir(dirpath) if os.path.isfile(os.path.join(dirpath,f))]
    for file in files:
        filepath = os.path.join(dirpath,file)
        try:
            # Parse and save to db
            logDF = read_logs(filepath, zipped)
            # Process bulks
            count, _ = logDF.shape
            for i in range(0,count,BULK_UPLOAD_SIZE):
                bulk = logDF[i:i+BULK_UPLOAD_SIZE]
                logs = list(bulk.apply(make_row, axis=1))
                Log.objects.bulk_create(logs)
            os.remove(filepath)
            logger.info("Read logs from {}".format(filepath))
        except Exception as e:
            # In case of failure move the file to errors dir
            errorDir = os.path.join(dirpath,'failed')
            if not os.path.isdir(errorDir):
                os.mkdir(errorDir)
            os.rename(filepath, os.path.join(errorDir,file))
            logger.warning("Error while reading logs from {}. Reason {}".format(filepath,e))

@shared_task
def process_log_times():
    """Recovers logs from DB and computes time per session

    It looks up the latests non processes logs, recovers them and
    creates a pandas Dataframe to compute times. 

    TODO: Mark completion milestone per course
    """
    def make_row(row):
        delta = row["delta_time"].days*84600 + row["delta_time"].seconds
        time_on_page = TimeModel(
            session=row["session"],
            username=row["username"],
            delta_time_float=delta,
            event_type_vertical=row["event_type_vertical"],
            course=row["course"])
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
    # Check the last processed log. If it is not found process all logs
    # Parse to json
    record = ProcessedRecord.load()
    if record.last_processed_time is None:
        logs_db = Log.objects.all()
    else:
        logs_db = Log.objects.filter(time__gte=(record.last_processed_time_timestamp - LOWER_LIMIT))
  
    if logs_db.count() == 0:
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
            recovered_blocks = load_course_from_LMS("{}+type@course+block@course".format(course_id.replace('course-v1','block-v1')))
        except Exception as e:
            print("Error while loading course structure", e)
            logger.warning("Course {} times not processed due to {}".format(course_id,e))
            continue
        course_blocks = read_json_course(recovered_blocks)
        course_dataframe = flatten_course_as_verticals(course_blocks)

        # Remove previous course info in the DB
        course_id_df = course_dataframe['course'].iloc[0]
        previous_values = CourseVertical.objects.filter(course=course_id_df)
        if len(previous_values) != 0:
            previous_values.delete()

        # Update vertical information on DB
        course_dataframe.apply(save_vertical_row, axis=1)

        # Parse and process time values
        parser = LogParser(df=course_dataframe)
        parser.load_logs(logs)
        parsed_logs = parser.parse_and_get_logs()
        timer = TimeOnPage(
            timeout_last_action=TIMEOUT,
            timeout_outlier=TIMEOUT,
            navigation_time=LOWER_LIMIT)
        timer.load_logs(parsed_logs)
        timer.do_user_time_session()
        timer.do_time_on_page(
            apply_outlier_timeout=True,
            apply_navigation_lower_limit=True)
        time_per_user_session = timer.time_on_page.copy()
        time_per_user_session["course"] = course_dataframe["course"][0]

        # Process bulk
        count, _ = time_per_user_session.shape
        for i in range(0,count,BULK_UPLOAD_SIZE):
            bulk = time_per_user_session[i:i+BULK_UPLOAD_SIZE]
            times = list(bulk.apply(make_row, axis=1))
            TimeOnPage.objects.bulk_create(times)

        logger.info("Course {} times processed".format(course_id))

@shared_task
def process_log_times_from_dir(logpath, coursepath, zipped=True):
    """OLD: Read log files and process times for a single course locally

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
    course_blocks = read_json_course_file(coursepath)
    dataframe = flatten_course_as_verticals(course_blocks)
    parser = LogParser(df=dataframe)
    parser.load_logs(logs)
    parsed_logs = parser.parse_and_get_logs()
    timer = TimeOnPage(
        timeout_last_action=TIMEOUT,
        timeout_outlier=TIMEOUT,
        navigation_time=LOWER_LIMIT)
    timer.load_logs(parsed_logs)
    timer.do_user_time_session()
    timer.do_time_on_page(
        apply_outlier_timeout=True,
        apply_navigation_lower_limit=True)
    time_per_user_session = timer.time_on_page.copy()
    time_per_user_session["course"] = dataframe["course"][0]
    time_per_user_session.apply(save_row, axis=1)