#
# Log processing and classification
#
# Inspired by Valeria's work
#
import pandas as pd
import numpy as np
import json
import re
import gzip
from edx_rest_api_client.client import OAuthAPIClient
from .models import *
from django.conf import settings

def read_json_course_file(filename):
    """ Read API recovered JSON and get blocks

    Arguments:
        filename String
    Returns:
        course_struct Pandas DataFrame
    """
    course_json = json.load(filename)
    course_df = pd.DataFrame.from_records(course_json["blocks"])
    course_struct = course_df.T
    return course_struct

def read_json_course(json_str):
    """ Read API recovered JSON and get blocks

    Arguments:
        filename String
    Returns:
        course_struct Pandas DataFrame
    """
    course_json = json.loads(json_str)
    course_df = pd.DataFrame.from_records(course_json["blocks"])
    course_struct = course_df.T
    return course_struct

def expand_list(df, list_column, new_column):
    """Expand a DataFrame with a column of list values.

    Source: https://medium.com/@johnadungan/expanding-lists-in-panda-dataframes-2724803498f8

    Arguments:
        df {pandas.core.frame.DataFrame} -- DataFrame with a column to expand
        list_column {str} -- name of the column (whose values are lists) to expand
        new_column {str} -- new name of the column
    Returns:
        pandas.core.frame.DataFrame -- DataFrame with list_column expanded
    """
    lens_of_lists = df[list_column].apply(len)
    max_len = max(lens_of_lists)
    origin_rows = range(df.shape[0])
    destination_rows = np.repeat(origin_rows, lens_of_lists)
    non_list_cols = (
        [idx for idx, col in enumerate(df.columns)
         if col != list_column]
    )
    expanded_df = df.iloc[destination_rows, non_list_cols].copy()
    expanded_df[new_column] = (
        [item for items in df[list_column] for item in items]
    )
    expanded_df[new_column+'_number'] = (
        [n for items in df[list_column]
            for item, n in zip(items, range(1, max_len + 1))]
    )
    expanded_df.reset_index(inplace=True, drop=True)
    return expanded_df

def flatten_course_as_verticals(course_df):
    """ Recover vertical info from course API json

    A JSON object recovered using the
    edx API at /api/courses/v1/blocks/?course_id=COURSE_ID&all_blocks=1&depth=all&requested_fields=children
    is parsed to a Pandas DataFrame

    Arguments:
        course_df Pandas DataFrame

    Returns:
        course_structure Pandas DataFrame with expanded columns
    """

    # 'type', 'block_id', 'student_view_url', 'lms_web_url', 'id', 'display_name', 'child', 'child_number'
    course_children = expand_list(course_df.dropna(), "children", "child")
    #'index', 'type', 'block_id', 'student_view_url', 'lms_web_url','children', 'id', 'display_name'
    course_no_children = course_df[course_df["children"].isna()].copy(
    ).reset_index()
    # The id of terminal nodes at any level
    course_no_children_name = course_no_children[['id', "display_name"]]
    # Course child name number is: the id of the parent block and the child id + data
    course_child_name = course_children[['id', 'child', 'display_name']].copy()
    # Merge them
    block_child_name = pd.concat(
        [course_child_name, course_no_children_name], ignore_index=True, sort=True)
    # Add what we know
    block_father_name = block_child_name.copy().rename(
        columns={'id': 'father', 'child': 'id'})
    # Start adding fathers to the left column
    merged_course_structure = block_father_name.merge(block_child_name, on='id')\
        .rename(columns={'father': 'father_x', 'id': 'father_y', 'child': 'id'})\
        .merge(block_child_name, on='id')\
        .rename(columns={'id': 'father_z', 'child': 'id', 'display_name': 'display_name_z'})\
        .merge(block_child_name, on='id')\
        .rename(columns={'id': 'father_w', 'child': 'id', 'display_name': 'display_name_w'})\
        .merge(block_child_name, on='id')
    # Recover and rename the columns
    valuable_columns = [
        'father_x', 'display_name_x', 'father_y', 'display_name_y', 'father_z', 'display_name_z',
        'father_w', 'display_name_w', 'id']
    columns_name = {
        'father_x': 'course',
        'father_y': 'chapter',
        'father_z': 'sequential',
        'father_w': 'vertical',
        'display_name_x': 'course_name',
        'display_name_y': 'chapter_name',
        'display_name_z': 'sequential_name',
        'display_name_w': 'vertical_name',
        'display_name': 'name'
    }
    merged_course_structure = merged_course_structure[valuable_columns].rename(
        columns=columns_name)
    # Add the missing types from course_no_children (terminal nodes)
    # and add numbers to elements
    course_structure = merged_course_structure.merge(course_children[['child', 'child_number']], left_on='vertical', right_on='child')\
        .drop(columns=['child']).rename(columns={'child_number': 'vertical_number'})\
        .merge(course_children[['child', 'child_number']], left_on='sequential', right_on='child')\
        .drop(columns=['child']).rename(columns={'child_number': 'sequential_number'})\
        .merge(course_children[['child', 'child_number']], left_on='chapter', right_on='child')\
        .drop(columns=['child']).rename(columns={'child_number': 'chapter_number'})\
        .merge(course_children[['child', 'child_number']], left_on='id', right_on='child')\
        .drop(columns=['child'])\
        .astype({'vertical_number': 'int64', 'child_number': 'int64', 'sequential_number': 'int64', 'chapter_number': 'int64'})\
        .merge(course_no_children[['index', 'type', "student_view_url", "lms_web_url"]], left_on='id', right_on='index')\
        .drop(columns="index")
    return course_structure

def flatten_course_as_verticals_from_dict(course_dict):
    """
    Parse json course structure from studio API into 
    numbered vertical blocks
    """
    data = []
    columns = [
        'course','course_name', 'chapter', 'chapter_name', 'sequential',
        'sequential_name', 'vertical', 'vertical_name', 'id', 'vertical_number',
        'sequential_number', 'chapter_number', 'child_number', 'type',
        'student_view_url', 'lms_web_url']
    
    # Recover info
    course = course_dict['id']
    course_name = course_dict['display_name']
    # Nothing to parse
    if not course_dict['has_children']:
        return pd.DataFrame(data,columns=columns)

    for chapter_number in range(len(course_dict['child_info']['children'])):
        chapter = course_dict['child_info']['children'][chapter_number]
        chapter_id = chapter['id']
        chapter_name = chapter['display_name']
        if chapter['has_children'] and 'child_info' in chapter:
            for sequential_number in range(len(chapter['child_info']['children'])):
                sequential = chapter['child_info']['children'][sequential_number]
                sequential_id = sequential['id']
                sequential_name = sequential['display_name']
                if sequential['has_children'] and 'child_info' in sequential:
                    for vertical_number in range(len(sequential['child_info']['children'])):
                        vertical = sequential['child_info']['children'][vertical_number]
                        vertical_id = vertical['id']
                        vertical_name = vertical['display_name']
                        if vertical['has_children'] and 'child_info' in vertical:
                            for child_number in range(len(vertical['child_info']['children'])):
                                child = vertical['child_info']['children'][child_number]
                                c_id = child['id']
                                c_type  = child['category']
                                data.append([
                                    course, course_name,
                                    chapter_id, chapter_name,
                                    sequential_id, sequential_name,
                                    vertical_id, vertical_name, c_id,
                                    vertical_number + 1, sequential_number + 1, 
                                    chapter_number + 1, child_number + 1,
                                    c_type, "",""
                                    ])

    return pd.DataFrame(data,columns=columns)

def read_logs(filename, ziped=False):
    """ Read logs and expand inner JSON values

    Recover valuable info

    Arguments:
        filename String
        ziped bool to unzip file
    Returns:
        expanded_records List of dictionnaries
    """
    def add_if_available(row, field, subfield):
        try:
            return row[field][subfield]
        except Exception:
            return np.nan
    # Either load records directly or do a json.loads and pandas.json_normalize
    df = pd.read_json(filename,compression='gzip' if ziped else None, lines=True)
    df["context.course_id"] = df.apply(lambda x: add_if_available(x,"context","course_id"),axis=1)
    df["context.org_id"] = df.apply(lambda x: add_if_available(x,"context","org_id"),axis=1)
    df["context.path"] = df.apply(lambda x: add_if_available(x,"context","path"),axis=1)
    df["context.user_id"] = df.apply(lambda x: add_if_available(x,"context","user_id"),axis=1)
    # Note: extra values to be extracted should be added here
    return df

def filter_by_log_qty(logs, min_logs = 15, user_field_name = 'username'):
    """Keeps the users with more than min_logs logs in the course
    
    Arguments:
        logs {pandas.core.frame.DataFrame} -- DataFrame to filter
    
    Keyword Arguments:
        min_logs {int} -- min quantity of logs to stay in the df (default: {15})
        user_field_name {str} -- name of the user name field (default: {'username'})
    
    Returns:
        pandas.core.frame.DataFrame -- [description]
    """
    users_count = logs.groupby([user_field_name])[user_field_name]\
                    .count()\
                    .to_frame()\
                    .rename(columns={user_field_name : 'count'})\
                    .reset_index()
    active_users = users_count[users_count['count'] > min_logs][user_field_name]
    return logs[logs.username.isin(active_users)]

def filter_course_team(logs, user_field_name = 'username', other_people = None):
    """Keeps the users that are not part of the course team
    
    Arguments:
        logs {pandas.core.frame.DataFrame} -- DataFrame to filter
    
    Keyword Arguments:
        user_field_name {str} -- name of the user name field  (default: {'username'})
        other_people {list} -- people known to be part of the course/page team (default: {None})
    
    Returns:
        pandas.core.frame.DataFrame -- [description]
    """
    def bool_regex(x):
        rgx = re.compile(r'.*(studio|instructor).*')
        if rgx.match(x) != None:
            return 1
        else:
            return 0

    users_and_etypes = logs[[user_field_name, 'event_type']].copy()
    users_and_etypes['event_type'] = users_and_etypes['event_type'].apply(bool_regex)
    users_and_profes = users_and_etypes.groupby(user_field_name).sum().reset_index()\
                        .sort_values('event_type', ascending = False)
    students = users_and_profes[users_and_profes.event_type == 0][user_field_name]

    if other_people is not None:
        students = students[~students.isin(other_people)]

    return logs[logs.username.isin(students)]

def load_course_blocks_from_LMS(course_code):
    """Uses an OAuthAPIClient to recover the course structure from the LMS backend

    Arguments:
        course_code string as block-v1:course_name+type@course+block@course

    Returns:
        JSON text response with course enumerated blocks
    """
    client = OAuthAPIClient(
        settings.BACKEND_LMS_BASE_URL,
        settings.BACKEND_SERVICE_EDX_OAUTH2_KEY,
        settings.BACKEND_SERVICE_EDX_OAUTH2_SECRET
    )

    response = client.get('{}/api/courses/v1/blocks/{}?depth=all&all_blocks=true&requested_fields=all,children'.format(settings.BACKEND_LMS_BASE_URL,course_code))
    if response.status_code != 200:
        raise Exception("Request to LMS failed for {}".format(course_code), str(response.text))
    return response.text

def load_course_structure_from_CMS(course_code):
    """Uses an OAuthAPIClient to recover the course structure from the CMS backend

    Arguments:
        course_code string course-v1:coursename

    Returns:
        JSON text response with course tree
    """
    client = OAuthAPIClient(
        settings.BACKEND_LMS_BASE_URL,
        settings.BACKEND_SERVICE_EDX_OAUTH2_KEY,
        settings.BACKEND_SERVICE_EDX_OAUTH2_SECRET
    )
    client.headers.update({"Accept" : "application/json, text/javascript, */*; q=0.01", "Content-Type": "application/json"})

    response = client.get("{}/course/{}?format=concise".format(settings.BACKEND_CMS_BASE_URL,course_code))

    if response.status_code != 200:
        raise Exception("Request to CMS failed for {}".format(course_code), str(response.text))
    return response.text