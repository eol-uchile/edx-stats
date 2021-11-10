#
# Based on Sebastian's work
#
import json
import re
import logging
import pandas as pd
import numpy as np
from edx_rest_api_client.client import OAuthAPIClient
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

pps_videore = re.compile(
    r'{"duration"\: ([0-9.]+), "code"\: "(.*)", "id"\: "(.*)", "currentTime"\: ([0-9.]+)}')
load_videore = re.compile(
    r'{"duration"\: ([0-9.]+), "code"\: "(.*)", "id"\: "(.*)"}')
seek_videore = re.compile(
    r'{"code"\: "(.*)", "new_time"\: ([0-9.]+), "old_time"\: ([0-9.]+), "duration"\: ([0-9.]+), "type"\: ".*", "id"\: "(.*)"}')
speedchange_videore = re.compile(
    r'{"current_time"\: ([0-9.]*), "old_speed"\: "([0-9.]*)", "code"\: "(.*)", "new_speed"\: "([0-9.]*)", "duration"\: ([0-9.]*), "id"\: "(.*)"}')

def video_info_parser(row):
    """
    Returns video id and its duration tuple from event column,
    using only play, pause and stop type events
    """
    etype = row.event_type
    pps = ['play_video', 'pause_video', 'stop_video']
    if etype in pps:
        match = pps_videore.match(row.event)
        return match[3], float(match[1])
    elif etype == 'load_video':
        match = load_videore.match(row.event)
        return match[3], float(match[1])
    elif etype == 'seek_video':
        match = seek_videore.match(row.event)
        return match[5], float(match[4])
    elif etype == 'speed_change_video':
        match = speedchange_videore.match(row.event)
        return match[6], float(match[5])
    else:
        return

def generate_video_dataframe(raw_video_data):
    """
    From video type logs, catch videos into it and creates a dataframe 
    with its id and duration
    """
    video_cols = ['id', 'duration']
    video_tuples = []
    for index, row in raw_video_data.iterrows():
        video_tuples.append(video_info_parser(row))
    all_video_df = pd.DataFrame(
        video_tuples, columns=video_cols).drop_duplicates()

    return all_video_df

def video_event_expander(row):
    """
    Returns a tuple with video player info,
    like where user started and stopped the video,
    from event column using only play, pause and stop type events
    """
    etype = row.event_type
    pps = ['play_video', 'pause_video', 'stop_video']
    if etype in pps:
        match = pps_videore.match(row.event)
        return (row.username, row.time, row.event_type,
                match[3], float(match[1]), float(match[4]),
                float(match[4]), float(match[4]))

    elif etype == 'load_video':
        match = load_videore.match(row.event)
        return (row.username, row.time, row.event_type,
                match[3], float(match[1]), -1, -1, -1)

    elif etype == 'seek_video':
        match = seek_videore.match(row.event)
        old = float(match[3])
        new = float(match[2])
        # Seek video forward
        if old < new:
            return (row.username, row.time, 'seek_forward',
                    match[5], float(match[4]), new, old, new)
        # Seek video backward
        elif old > new:
            return (row.username, row.time, 'seek_back',
                    match[5], float(match[4]), new, old, new)
        else:
            return (row.username, row.time, 'seek_equal',
                    match[5], float(match[4]), new, old, new)
    elif etype == 'speed_change_video':
        match = speedchange_videore.match(row.event)
        old = float(match[2])
        new = float(match[4])
        if old < new:  # Speed increased
            return (row.username, row.time, 'speed_change_up',
                    match[6], float(match[5]), float(match[1]), old, new)
        elif old > new:  # Speed decreased
            return (row.username, row.time, 'speed_change_down',
                    match[6], float(match[5]), float(match[1]), old, new)
        else:
            return (row.username, row.time, 'speed_change_equal',
                    match[6], float(match[5]), float(match[1]), old, new)

    else:
        return

def expand_event_info(video_logs):
    """
    From video type logs, creates a dataframe 
    with expanded video player info,
    initially contained in the event column
    """
    dframe_cols = ['username', 'time', 'event_type',
                'id', 'duration', 'currenttime', 'old', 'new']
    extend_video_tuples = []
    for index, row in video_logs.iterrows():
        extend_video_tuples.append(video_event_expander(row))
    extend_video_logs = pd.DataFrame(extend_video_tuples, columns=dframe_cols)
    return extend_video_logs