import logging
from datetime import timedelta, datetime, date
import pandas as pd
from django.conf import settings
from django.db import transaction
from celery import shared_task
from core.models import Log, CourseVertical, StaffUserName
from core.processing import read_json_course, \
    flatten_course_as_verticals, read_logs, filter_by_log_qty, filter_course_team
from core.tasks import process_logs_standard_procedure, process_logs_single_course
from core.classifier import LogParser
from visits.models import VisitOnPage

logger = logging.getLogger(__name__)
DAY_WINDOW = timedelta(days=3)
BULK_UPLOAD_SIZE = 500


@shared_task
def process_visit_count(end_date, day_window=None, run_code=None, course=None):
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
    - run_code to describe errors in a single file Errors-{run_code}.log
    - course if only one course is to be processed

    """

    def make_row(row, date):
        vertical_to_associate = CourseVertical.objects.filter(
            vertical__icontains=row["vertical"],
            course__icontains=row["course"],  
        ).first()
        visit_on_page = VisitOnPage(
            vertical= vertical_to_associate,
            username=row["username"],
            count=row["visits"],
            time=date)
        return visit_on_page

    def compute_visits(dataframe, course_df, date, course_id, code):
        # Parse and process time values
        parser = LogParser(df=course_df, run_code=code)
        parser.load_logs(dataframe)
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

        user_vertical_visits = navigation_logs_cleaned \
            .groupby(['username', 'event_type_vertical']) \
            .event_type_vertical.agg('count') \
            .to_frame('visits') \
            .reset_index()

        merged_sequential_visits = user_vertical_visits \
            .rename(columns={"event_type_vertical": "vertical"}) \
            .merge(course_df, on='vertical')

        with transaction.atomic():
            # Delete today's info to overwrite
            previous_visits = VisitOnPage.objects.filter(
                time__date=date, vertical__course=course_df["course"][0])
            previous_visits.delete()

            # Upload bulks to DB
            count, _ = merged_sequential_visits.shape
            for i in range(0, count, BULK_UPLOAD_SIZE):
                bulk = merged_sequential_visits[i:i+BULK_UPLOAD_SIZE]
                visits = list(bulk.apply(
                    lambda row: make_row(row, date), axis=1))
                VisitOnPage.objects.bulk_create(visits)

            logger.info("Course {}, {} visits processed for {}".format(
                course_id, count, date))

    if course is not None:
        process_logs_single_course(
            compute_visits, "visits", course, end_date, day_window, run_code)
    else:
        process_logs_standard_procedure(
            compute_visits, "visits", end_date, day_window, run_code)


@shared_task
def compute_visit_batches(initial_date=None, time_delta=timedelta(days=3), final_date=None, course=None):
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
        process_visit_count(times[i], time_delta,
                            run_code=run_code, course=course)
    logger.info("Finished processing visits")
