import math
import os
import pytz
import logging
import pandas as pd
from datetime import timedelta
from celery import shared_task
from django.conf import settings
from core.models import Log, CourseVertical, LogFile, StaffUserName, Student
from core.processing import read_json_course, read_json_course_file, \
    flatten_course_as_verticals, read_logs, load_course_blocks_from_LMS, \
    filter_course_team, filter_by_log_qty
from django.db import connections

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
            is_active=True,
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
        json_text, update = load_course_blocks_from_LMS(course_code)
    except Exception as e:
        # Abort processing
        logger.warning(e, exc_info=True)
        return
    course_blocks = read_json_course(json_text)
    dataframe = flatten_course_as_verticals(course_blocks)

    def save_row(row):
        vertical = CourseVertical(
            is_active=True,
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
        try:
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
        except Exception:
            logger.warn(str(Exception))
            return None

    files = [f for f in os.listdir(
        dirpath) if os.path.isfile(os.path.join(dirpath, f))]
    for file in files:
        if file == ".gitkeep":
            continue
        filepath = os.path.join(dirpath, file)
        if LogFile.objects.filter(file_name=file).first() is not None:
            logger.info("Skipping file {}".format(file))
            continue
        try:
            # Parse and save to db
            log_df = read_logs(filepath, zipped)
            # Process bulks
            count, _ = log_df.shape
            for i in range(0, count, BULK_UPLOAD_SIZE):
                bulk = log_df[i:i+BULK_UPLOAD_SIZE]
                logs = list(filter(lambda x: x is not None,
                                   list(bulk.apply(make_row, axis=1))))
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


def process_logs_single_course(procedure, name, course_id, end_date=None, day_window=None, run_code=None):
    """Recovers logs from DB for a course and computes a procedure

    Computes procedure for each day until the end date given a day window.
    Timezone localization will be set according to settings.py

    Arguments
    - procedure to compute stats given a dataframe with daily logs for a course.
        Expected signature is 
        procedure(dataframe, course_dataframe, date, course_id, run_code)
    - name to display during logging
    - course_id to process
    - end_date datetime to use and upper date limit, 
        lower date limit is set as end_date - DAY_WINDOW.
        If none is provided all logs will be processed
    - day_window timedelta to subtract from end_date.
        If none is provided default DAY_WINDOW is used
    - run_code to save errors on a single file with the same code

    """
    def test_exists(row, previous_verticals):
        """
        Returns true if vertical exists
        """
        return previous_verticals.get(row["id"], None) is not None

    def update_vertical_row(row, previous_verticals):
        previous_vertical = previous_verticals.get(row["id"])
        previous_vertical.is_active = True
        previous_vertical.chapter = row['chapter']
        previous_vertical.chapter_name = row['chapter_name']
        previous_vertical.sequential = row['sequential']
        previous_vertical.sequential_name = row['sequential_name']
        previous_vertical.vertical_name = row['vertical_name']
        previous_vertical.block_id = row['id']
        previous_vertical.vertical_number = row['vertical_number']
        previous_vertical.sequential_number = row['sequential_number']
        previous_vertical.chapter_number = row['chapter_number']
        previous_vertical.child_number = row['child_number']
        previous_vertical.block_type = row['type']
        previous_vertical.student_view_url = row['student_view_url']
        previous_vertical.lms_web_url = row['lms_web_url']

    def create_vertical_row(row):
        vertical = CourseVertical(
            is_active=True,
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
        return vertical

    time_window = DAY_WINDOW if day_window is None else day_window
    tz = pytz.timezone(settings.TIME_ZONE)
    end_date_localized = None if end_date is None else tz.localize(end_date)
    staff_users = StaffUserName.objects.all()

    if course_id == '':
        return
    try:
        # Do formating if necessary
        recovered_blocks, update = load_course_blocks_from_LMS(
            "{}+type@course+block@course".format(course_id.replace('course-v1', 'block-v1')))
    except Exception as e:
        logger.warning(
            "Failed to load {} form LMS".format(e), exc_info=True)
        return
    course_blocks = read_json_course(recovered_blocks)
    course_dataframe = flatten_course_as_verticals(course_blocks)

    # If no valid verticals were found abort
    count, _ = course_dataframe.shape
    if count == 0:
        logger.warning(
            "Course {} was either empty or an error ocurred".format(course_id))
        return

    # Remove previous course info in the DB updating its field is_active
    if update:
        course_id_df = course_dataframe['course'].iloc[0]
        previous_info = list(CourseVertical.objects.filter(course=course_id_df))
        previous_verticals = {}
        for v in previous_info:
            # Deactivate on default
            v.is_active=False
            previous_verticals[v.block_id] = v
        # Split groups
        active_verticals_row = course_dataframe[course_dataframe.apply(lambda row: test_exists(row,previous_verticals), axis=1)]
        new_verticals_row = course_dataframe[course_dataframe.apply(lambda row: not test_exists(row,previous_verticals), axis=1)]
        # Create new objects
        count, _ = new_verticals_row.shape
        if count != 0:
            new_course_verticals = list(new_verticals_row.apply(create_vertical_row, axis=1))
            CourseVertical.objects.bulk_create(new_course_verticals) # Single update
        # Update old
        active_verticals_row.apply(lambda row: update_vertical_row(row, previous_verticals), axis=1)
        CourseVertical.objects.bulk_update(previous_info, [
            "is_active","chapter","chapter_name","sequential","sequential_name",
            "vertical_name","block_id","vertical_number","sequential_number",
            "chapter_number","child_number","block_type","student_view_url",
            "lms_web_url"]) # Single update

    # This course
    if end_date is None:
        course_logs = Log.objects.filter(course_id=course_id).values(
            'username', 'event_type', 'name', 'referer', 'time', 'event', 'course_id', 'org_id', 'user_id', 'path', 'page')
    else:
        course_logs = Log.objects.filter(time__gte=(
            end_date_localized - time_window), time__lt=(end_date_localized), course_id=course_id).values('username', 'event_type', 'name', 'referer', 'time', 'event', 'course_id', 'org_id', 'user_id', 'path', 'page')

    if course_logs.count() == 0:
        return

    logs_full = pd.DataFrame(course_logs)

    # Get staff users to ban from stats
    users = [u.username for u in staff_users], filter_by_log_qty

    logs = filter_course_team(logs_full, other_people=users)
    # Save memory on
    del logs_full

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
            procedure(day_logs, course_dataframe,
                      period, course_id, run_code)
        except Exception as error:
            logger.warning("Failed to process {} on {}, {}. Reason: {}".format(
                name, course_id, period, error), exc_info=True)


def process_logs_standard_procedure(procedure, name, end_date=None, day_window=None, run_code=None):
    """Recovers logs from DB and computes a procedure

    Computes procedure for each day until the end date given a day window.
    Timezone localization will be set according to settings.py

    Arguments
    - procedure to compute stats given a dataframe with daily logs for a course.
        Expected signature is 
        procedure(dataframe, course_dataframe, date, course_id, run_code)
    - name to display during logging
    - end_date datetime to use and upper date limit, 
        lower date limit is set as end_date - DAY_WINDOW.
        If none is provided all logs will be processed
    - day_window timedelta to subtract from end_date.
        If none is provided default DAY_WINDOW is used
    - run_code to save errors on a single file with the same code

    """
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
        logger.info("No logs for processing '{}'".format(name))
        return

    # Create subsets for each course
    # and update the Processed log if any was successful
    for course_dict in course_ids_db:
        course_id = course_dict["course_id"]
        if course_id == '':
            continue
        process_logs_single_course(
            procedure, name, course_id, end_date, day_window, run_code)

def load_users_from_api():
    """
    Process all users, creating new ones and updating old information
    """
    def test_exists(row, previous_users):
        """
        Returns true if user exists
        """
        return previous_users.get(row["username"], None) is not None

    def update_user_row(row, previous_users):
        previous_user = previous_users.get(row["username"])
        previous_user.name = row["name"]
        previous_user.gender = row["gender"]
        previous_user.year_of_birth = row["year_of_birth"]
        previous_user.country = row["country"]

    def create_user_row(row):
        student = Student(
            username=row["username"],
            date_joined=row["date_joined"],
            name=row["name"],
            email=row["email"],
            gender=row["gender"],
            year_of_birth=row["year_of_birth"],
            country=row["country"])
        return student

    with connections['lms'].cursor() as cursor:
        cursor.execute(
            "SELECT "
            "username, date_joined, name, email, gender, year_of_birth, country "
            "FROM "
            "auth_user "
            "JOIN auth_userprofile ON auth_user.id = auth_userprofile.user_id "
            "WHERE is_staff=False"
        )
        users = cursor.fetchall()
        users_dataframe = pd.DataFrame(users, 
                            columns =['username', 'date_joined', 'name', 
                                    'email', 'gender', 'year_of_birth','country'])

    previous_info = list(Student.objects.all())
    previous_users = {}
    for s in previous_info:
        previous_users[s.username] = s
    # Split groups
    actual_users_row = users_dataframe[users_dataframe.apply(lambda row: test_exists(row,previous_users), axis=1)]
    new_users_row = users_dataframe[users_dataframe.apply(lambda row: not test_exists(row,previous_users), axis=1)]
    count, _ = new_users_row.shape
    if count != 0:
        new_users = list(new_users_row.apply(create_user_row, axis=1))
        Student.objects.bulk_create(new_users) # Single update
    # Update old
    actual_users_row.apply(lambda row: update_user_row(row, previous_users), axis=1)
    Student.objects.bulk_update(previous_info, [
        "username","date_joined","name","email",
        "gender","year_of_birth","country"]) # Single update