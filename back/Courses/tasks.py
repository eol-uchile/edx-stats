import math
import pandas as pd
from datetime import timedelta
from celery import shared_task
from Courses.models import Log, CourseVertical, TimeOnPage as TimeModel
from Courses.processing import read_json_course, flatten_course_as_verticals, read_logs, filter_by_log_qty, filter_course_team
from Courses.classifier import LogParser, TimeOnPage

TIMEOUT = timedelta(minutes=10)
LOWER_LIMIT = timedelta(seconds=15)  # files


@shared_task
def count_logs():
    return Log.objects.count()


@shared_task
def load_course(filepath):
    """Load course structure from filesystem

    TODO: fetch data from OpenEdx API

    Arguments:
    - filepath String
    """
    course_blocks = read_json_course(filepath)
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
    dataframe.apply(save_row, axis=1)


@shared_task
def load_logs(filepath):
    """Load logs from a course from filesystem

    TODO: read data from multiple log files and remove them
    from disk afterwards

    Arguments:
    - filepath String
    """
    def save_row(row):
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
        log.save()
    logs = pd.DataFrame.from_records(read_logs(filepath))
    logs.apply(save_row, axis=1)


@shared_task
def process_log_times(logpath, coursepath):
    def save_row(row):
        delta = row["delta_time"].days*84600 + row["delta_time"].seconds
        time_on_page = TimeModel(
            session=row["session"],
            username=row["username"],
            delta_time_float=delta,
            event_type_vertical=row["event_type_vertical"],
            course=row["course"])
        time_on_page.save()

    logs_full = pd.DataFrame.from_records(read_logs(logpath))
    logs = filter_course_team(logs_full, other_people=[
                              'gap', 'francisco_sereno'])
    logs = filter_by_log_qty(logs, min_logs=15)
    course_blocks = read_json_course(coursepath)
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
