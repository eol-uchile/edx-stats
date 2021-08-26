#
# Based on Sebastian's work
#
import logging
from datetime import timedelta, datetime, date
import pandas as pd
from django.conf import settings
from django.db import transaction
from celery import shared_task
from core.models import CourseVertical
from core.tasks import process_logs_standard_procedure, process_logs_single_course
from views.processing import generate_video_dataframe, expand_event_info
from views.models import Segment, ViewOnVideo, Video

logger = logging.getLogger(__name__)
DAY_WINDOW = timedelta(days=3)
BULK_UPLOAD_SIZE = 500


@shared_task
def process_views_count(end_date, day_window=None, run_code=None, course=None):
    """Recovers logs from DB and computes views on videos per day for each video

    Computes views on videos for each day until the end date given a day window.
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
    def get_students_video_logs(course_data):
        instructors = course_data[course_data.event_type.str.contains(
            r'instructor|studio')]['username'].unique()
        only_students = course_data[~course_data.username.isin(instructors)]
        video_event_type = ['hide_transcript',
                            'load_video',
                            'pause_video',
                            'play_video',
                            'seek_video',
                            'show_transcript',
                            'speed_change_video',
                            'stop_video',
                            'video_hide_cc_menu',
                            'video_show_cc_menu',
                            ]
        video_mobile_type = ['edx.video.transcript.hidden',
                             'edx.video.loaded',
                             'edx.video.paused',
                             'edx.video.played',
                             'edx.video.position.changed',
                             'edx.video.transcript.shown',
                             'edx.video.stopped',
                             ]
        raw_video_course_logs = only_students[only_students.event_type.isin(
            video_event_type + video_mobile_type)]
        return raw_video_course_logs

    def save_videos_row(row, course_id):
        vertical_to_refer = CourseVertical.objects.filter(
            course=course_id,
            block_id__icontains=row["id"]
        )
        previous = Video.objects.filter(
            block_id=row["id"]
        )
        if(previous.count() != 0):
            video = previous.first()
            video.vertical = vertical_to_refer.first()
            video.duration = row["duration"]
            video.save()
        else:
            video = Video(
                vertical=vertical_to_refer.first(),
                block_id=row["id"],
                duration=row["duration"],
                watch_time=0)
            video.save()

    def make_segment_dataframe(grouped):
        df_cols = ['id', 'username', 'time', 'start', 'end']
        all_pairs = []
        malformed_pairs = 0
        for name, group in grouped:
            state = {'id': None,
                     'init': None,
                     'action': None}
            for index, row in group.iterrows():
                etype = row.event_type
                if etype == 'play_video':
                    state['id'] = row.id
                    state['init'] = row.currenttime
                    state['action'] = row.event_type
                elif etype == 'seek_forward':
                    if state['id'] == row.id:
                        # skip segment
                        # all_pairs.append
                        if state['action'] == 'play_video':
                            try:
                                assert(row.old <= row.new)
                                all_pairs.append(
                                    (row.id, row.username, row.time, row.old, row.new))
                            except AssertionError:
                                malformed_pairs += 1

                    state['id'] = row.id
                    state['init'] = row.currenttime
                    state['action'] = row.event_type
                elif etype == 'seek_back':
                    if state['id'] == row.id and state['action'] == 'play_video':
                        try:
                            assert(state['init'] <= row.old)
                            all_pairs.append(
                                (row.id, row.username, row.time, state['init'], row.old))
                        except AssertionError:
                            malformed_pairs += 1

                    state['id'] = row.id
                    state['init'] = row.currenttime
                    state['action'] = row.event_type
                elif etype == 'pause_video' or etype == 'stop_video':
                    if state['id'] == row.id and state['action'] == 'play_video':
                        try:
                            assert(state['init'] <= row.currenttime)
                            all_pairs.append(
                                (row.id, row.username, row.time, state['init'], row.currenttime))
                        except AssertionError:
                            malformed_pairs += 1
                    state['id'] = row.id
                    state['init'] = row.currenttime
                    state['action'] = row.event_type
                else:
                    continue
        logger.info("Malformed pairs processed: {}".format(malformed_pairs))
        segments_df = pd.DataFrame(all_pairs, columns=df_cols)
        return segments_df

    def save_views_row(row, course_df):
        video_to_refer = Video.objects.filter(
            block_id=row['id']
        ).first()
        previous = ViewOnVideo.objects.filter(
            video=video_to_refer, username=row['username'])
        if(previous.count() != 0):
            pass
        else:
            view = ViewOnVideo(
                video=video_to_refer,
                username=row['username']
            )
            view.save()

    def make_segment(row):
        view_to_refer = ViewOnVideo.objects.filter(
            video__block_id=row['id'],
            username=row['username']
        ).first()
        segment = Segment(
            view=view_to_refer,
            time=row['time'],
            start=row['start'],
            end=row['end']
        )
        return segment

    def compute_views(dataframe, course_df, date, course_id, code):
        cols_to_use = ['username', 'time', 'event_type', 'event']
        raw_video_course_logs = get_students_video_logs(dataframe[cols_to_use])
        videos_in_logs = generate_video_dataframe(raw_video_course_logs)
        # Remove previous course info in the DB
        course_id_df = course_df["course"][0]
        with transaction.atomic():
            # Update information on DB
            videos_in_logs.apply(
                lambda row: save_videos_row(row, course_id_df), axis=1)
            logger.info("Course {}, videos updated for {}".format(
                course_id, date))
        extend_video_logs = expand_event_info(
            raw_video_course_logs)  # expands info into columns
        sort_video_logs = extend_video_logs[extend_video_logs.event_type != 'load_video'].copy(
        )
        sort_video_logs['time'] = pd.to_datetime(
            sort_video_logs['time'], unit='ns')
        sort_video_logs.sort_values('time', inplace=True)
        grouped_logs = sort_video_logs.groupby('username')
        segments_df = make_segment_dataframe(grouped_logs)
        views_df = segments_df[['id', 'username']].drop_duplicates()

        with transaction.atomic():
            # Update information on DB
            views_df.apply(lambda row: save_views_row(row, course_df), axis=1)
            logger.info("Course {}, video viewers updated for {}".format(
                course_id, date))

        with transaction.atomic():
            # Delete today's info to overwrite
            previous_segments = Segment.objects.filter(
                time__date=date, view__video__vertical__course=course_id_df)
            previous_segments.delete()

            # Upload bulks to DB
            count, _ = segments_df.shape
            for i in range(0, count, BULK_UPLOAD_SIZE):
                bulk = segments_df[i:i+BULK_UPLOAD_SIZE]
                segments = list(bulk.apply(
                    lambda row: make_segment(row), axis=1))
                Segment.objects.bulk_create(segments)

            logger.info("Course {}, {} segments processed for {}".format(
                course_id, count, date))

    if course is not None:
        process_logs_single_course(
            compute_views, "views", course, end_date, day_window, run_code)
    else:
        process_logs_standard_procedure(
            compute_views, "views", end_date, day_window, run_code)


@shared_task
def compute_view_batches(initial_date=None, time_delta=timedelta(days=1), final_date=None, course=None):
    """
    Process all views on videos by batches from initial_date to today

    Arguments
    - initial_date string like 2018-09-24

    - time_delta timedelta object
    """
    end = datetime.today()
    if final_date is not None:
        end = final_date
    views = pd.date_range(
        start=initial_date, end=end, freq=time_delta)
    run_code = str(date.today())

    for i in range(1, len(views)):
        logger.info("Processing video views logs for time {} with offset {}".format(
            views[i], time_delta))
        # This is a pandas timestamp Timestamp class, it should be replaced with datetime for a more
        # standard module
        process_views_count(views[i], time_delta,
                            run_code=run_code, course=course)
    logger.info("Finished processing views")
