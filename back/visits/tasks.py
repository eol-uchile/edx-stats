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


@shared_task
def process_visit_count(endDate, day_window=None):
    pass


def compute_visit_batches(initialDate=None, time_delta=timedelta(days=3)):
    """
    Process all visits by batches from initialDate to today

    Arguments
    - initialDate string like 2018-09-24

    - time_delta timedelta object
    """
    times = pd.date_range(
        start=initialDate, end=datetime.today(), freq=time_delta)
    for i in range(1, len(times)):
        logger.info("Processing time logs for time {} with offset {}".format(
            times[i], time_delta))
        # This is a pandas timestamp Timestamp class, it should be replaced with datetime for a more
        # standard module
        process_visit_count(times[i], time_delta)
