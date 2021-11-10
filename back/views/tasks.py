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
    def get_video_logs(course_data):
        """
        From course logs, returns video type logs like play_video or stop_video
        """
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
        raw_video_course_logs = course_data[course_data.event_type.isin(
            video_event_type + video_mobile_type)]
        return raw_video_course_logs
    
    def test_exists(id, previous_objects):
        """
        Returns true if video/view exists in previous_objects dictionary
        """
        return previous_objects.get(id, None) is not None

    def create_videos_row(row, vertical_to_associate, videos):
        """
        Creates Video model instance
        referencing its CourseVertical by block_id
        """
        video = Video(
            vertical=vertical_to_associate,
            block_id=row["id"],
            duration=row["duration"],
            watch_time=0)
        videos[row["id"]] = video
        return video

    def make_segment_dataframe(grouped):
        """
        Creates a dataframe with start-stop segment per user and video
        """
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

    def create_views_row(row, video_to_associate, views):
        """
        Creates ViewOnVideo model instance if it does not already exist
        referencing the video watched by block_id
        """
        view = ViewOnVideo(
            video=video_to_associate,
            username=row['username'],
            coverage=0
        )
        views[row["id"]+"-"+row["username"]] = view
        return view

    def make_segment(row, view_to_associate):
        """
        Creates Segment model instance
        referencing the user who watched those seconds
        """
        segment = Segment(
            view=view_to_associate,
            time=row['time'],
            start=int(row['start']),
            end=int(row['end'])
        )
        return segment

    def compute_views(dataframe, course_df, date, course_id, code):
        cols_to_use = ['username', 'time', 'event_type', 'event']
        raw_video_course_logs = get_video_logs(dataframe[cols_to_use])
        videos_in_logs = generate_video_dataframe(raw_video_course_logs)
        course_id_df = course_df["course"][0]
        
        verticals = list(CourseVertical.objects.filter(course=course_id_df))
        verticals_to_associate = {}
        for b in verticals:
                verticals_to_associate[b.vertical] = b

        previous_info = list(Video.objects.filter(vertical__course=course_id_df))
        previous_videos = {}
        for b in previous_info:
            previous_videos[b.block_id] = b
        # Split groups
        new_videos_row = videos_in_logs[videos_in_logs.apply(lambda row: not test_exists(row["id"], previous_videos), axis=1)]
        # Create new videos
        count, _ = new_videos_row.shape
        if count != 0:
            new_videos = list(new_videos_row.apply(lambda row: create_videos_row(row, verticals_to_associate.get(row["id"]), previous_videos), axis=1))
            Video.objects.bulk_create(new_videos)

        extend_video_logs = expand_event_info(
            raw_video_course_logs)
        sort_video_logs = extend_video_logs[extend_video_logs.event_type != 'load_video'].copy(
        )
        sort_video_logs['time'] = pd.to_datetime(
            sort_video_logs['time'], unit='ns')
        sort_video_logs.sort_values('time', inplace=True)
        grouped_logs = sort_video_logs.groupby('username')
        segments_df = make_segment_dataframe(grouped_logs)
        views_df = segments_df[['id', 'username']].drop_duplicates()

        previous_info = list(ViewOnVideo.objects.filter(video__vertical__course=course_id_df))
        previous_views = {}
        for b in previous_info:
            previous_views[str(b.video.block_id+"-"+b.username)] = b
        # Split groups
        new_views_row = views_df[views_df.apply(lambda row: not test_exists(row["id"]+"-"+row["username"], previous_views), axis=1)]
        # Create new views on video
        count, _ = new_views_row.shape
        if count != 0:
            new_views = list(new_views_row.apply(lambda row: create_views_row(row, previous_videos.get(row["id"]), previous_views), axis=1))
            ViewOnVideo.objects.bulk_create(new_views)

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
                    lambda row: make_segment(row, previous_views.get(str(row['id']+"-"+row['username']))), axis=1))
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
def compute_view_batches(initial_date=None, time_delta=timedelta(days=3), final_date=None, course=None):
    """
    Process all views on videos by batches from initial_date to today

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
        logger.info("Processing video views logs for time {} with offset {}".format(
            times[i], time_delta))
        # This is a pandas timestamp Timestamp class, it should be replaced with datetime for a more
        # standard module
        process_views_count(times[i], time_delta,
                            run_code=run_code, course=course)
    logger.info("Finished processing views")


@shared_task       
def calculate_coverage(course=None):
    """
    Using the segments created, calculates the percentage of coverage for each
    user (ViewOnVideo) to the corresponding video.

    Arguments
    - course to be processed
    """
    
    def compute_coverage(course_id):
        segments_user_video = ViewOnVideo.objects.filter(
            video__vertical__is_active=True,
            video__vertical__course__icontains=course_id,
        ).order_by(
            'video__vertical__chapter_number',
            'video__vertical__sequential_number',
            'video__vertical__vertical_number',
            'video__vertical__child_number'
        ).annotate(
            video_duration=F('video__duration'),
        )
        for viewer in segments_user_video:
            segments = Segment.objects.filter(
                view__id=viewer.id,
            )
            length, _ = ut.klee_distance(segments)
            coverage = length/viewer.video_duration
            viewer.coverage = coverage
            viewer.save()

    if course is not None:
        compute_coverage(course)
    else:
        return


@shared_task
def compute_video_coverage(course=None):
    """
    Process user coverage for each video

    Arguments
    - course_code string as block-v1:course_name+type@course+block@course

    """
    logger.info("Processing user coverage")
    calculate_coverage(course=course)
    logger.info("Finished processing coverage")
