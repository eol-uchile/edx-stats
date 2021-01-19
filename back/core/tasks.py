import math
import os
import logging
from celery import shared_task
from django.conf import settings
from core.models import Log, CourseVertical, LogFile
from core.processing import read_json_course, read_json_course_file, \
    flatten_course_as_verticals, read_logs, load_course_blocks_from_LMS

logger = logging.getLogger(__name__)
BULK_UPLOAD_SIZE = 500


def load_course(filepath):
    """Load course structure from filesystem

    Arguments:
    - filepath String
    """
    with open(filepath) as f:
        course_blocks = read_json_course_file(f)
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
    logger.info("Loaded course verticals for {}".format(course_id))


def load_course_from_api(course_code):
    """Load course structure from LMS API

    Arguments:
    - course_code String as block-v1:course_name+type@course+block@course
    """
    try:
        json_text = load_course_blocks_from_LMS(course_code)
    except Exception as e:
        # Abort processing
        logger.warning(e, exc_info=True)
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

    files = [f for f in os.listdir(
        dirpath) if os.path.isfile(os.path.join(dirpath, f))]
    for file in files:
        if file == ".gitkeep":
            continue
        filepath = os.path.join(dirpath, file)
        if LogFile.objects.filter(file_name=file).count() > 0:
            logger.info("Skipping file {}".format(file))
            continue
        try:
            # Parse and save to db
            log_df = read_logs(filepath, zipped)
            # Process bulks
            count, _ = log_df.shape
            for i in range(0, count, BULK_UPLOAD_SIZE):
                bulk = log_df[i:i+BULK_UPLOAD_SIZE]
                logs = list(bulk.apply(make_row, axis=1))
                Log.objects.bulk_create(logs)
            os.remove(filepath)
            # Register file saved
            LogFile(file_name=file).save()
            logger.info("Read logs from {}".format(filepath))
        except Exception as e:
            # In case of failure move the file to errors dir
            error_dir = os.path.join(dirpath, 'failed')
            if not os.path.isdir(error_dir):
                os.mkdir(error_dir)
            os.rename(filepath, os.path.join(error_dir, file))
            logger.warning(
                "Error while reading logs from {}. Reason {}".format(filepath, e), exc_info=True)
