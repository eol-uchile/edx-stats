import re
from datetime import timedelta
import pandas as pd
import numpy as np

re_page_view_courseware = re.compile("courseware\/[^/]+([^/]+)*\/?")
re_page_view_course = re.compile("course\/$")
re_wiki_view = re.compile("wiki")
re_progress_view = re.compile("progress$")
re_bookmarks_view = re.compile("bookmarks\/$")
re_page_view_main = re.compile("courses\/.+")
re_page_close = re.compile("^page_close$")
# discussion related
re_forum_view = re.compile("discussion\/forum\/$")
re_forum_view_user_profile = re.compile(
    "discussion\/forum\/users\/[^/]+$")
re_forum_thread_view = re.compile("discussion\/forum\/[^/]+\/threads\/[^/]+$")

# pages for referer
re_from_login = re.compile("eol.uchile.cl\/login?")
re_from_dashboard = re.compile("\/dashboard$")

# navigation
re_next_vertical = re.compile("^seq_next$")
re_next_sequence = re.compile("^edx.ui.lms.sequence.next_selected$")
re_previous_vertical = re.compile("^seq_prev$")
re_previous_sequence = re.compile("^edx.ui.lms.sequence.previous_selected$")
re_goto_vertical = re.compile("^seq_goto$")

# to match event column in navigation events
re_event_vertical = re.compile(
    '^\{\\\\old\\\\\"\: (\d), \\\\\"current_tab\\\\\"\: (\d), \\\\\"tab_count\\\\\"\: (\d), \\\\\"new\\\\\"\: (\d), \\\\\"widget_placement\\\\\"\: \\\\\"(.*?)\\\\", \\\\\"id\\\\\"\: \\\\\"(.+?)\\\\\"\}\"$')
re_event_sequence = re.compile(
    '^\{\\\\tab_count\\\\\"\: (\d), \\\\\"widget_placement\\\\\"\: \\\\\"(.*?)\\\\\", \\\\\"current_tab\\\\\"\: (\d), \\\\\"id\\\\\"\: \\\\\"(.+?)\\\\\"\}\"$')
re_event_goto_vertical = re.compile(
    '^\{\\\\target_tab\\\\\"\: (\d), \\\\\"old\\\\\"\: (\d), \\\\\"current_tab\\\\\"\: (\d), \\\\\"tab_count\\\\\"\: (\d), \\\\\"new\\\\\"\: (\d), \\\\\"widget_placement\\\\\"\: \\\\\"(.*?)\\\\\", \\\\\"id\\\\\"\: \\\\\"(.+?)\\\\\"\}\"$')


class TimeOnPage:
    """TimeOnPage Class
    Compute number of sessions and time on pages of a course with logs from edX
    """

    def __init__(self, timeout_last_action=timedelta(minutes=10),
                 timeout_outlier=timedelta(minutes=10), navigation_time=timedelta(seconds=10),
                 last_action_recognize=timedelta(hours=3, minutes=30),
                 outlier_recognize=timedelta(minutes=30)):
        """TimeOnPage class constructor

        Keyword Arguments:
            timeout_last_action {datetime.timedelta}
            -- duration to which the last actions are changed (default: {timedelta(minutes=10)})
            timeout_outlier {datetime.timedelta}
            -- duration to which the outliers actions are changed  (default: {timedelta(minutes=10)})
            navigation_time {datetime.timedelta}
            -- min time to not be considered a page visited while navigating (default: {timedelta(seconds=10)})
            last_action_recognize {datetime.timedelta}
            -- min duration of an action to be classified as last action (default: {timedelta(hours=3, minutes=30)})
            outlier_recognize {datetime.timedelta}
            -- min duration of an action to be classified as outlier (default: {timedelta(minutes=30)})
        """
        self.timeout_last_action = timeout_last_action
        self.timeout_outlier = timeout_outlier
        self.navigation_time = navigation_time
        self.last_action_recognize = last_action_recognize
        self.outlier_recognize = outlier_recognize

        self.session_number = 1
        self.user_time_session = None
        self.time_on_page = None
        self.logs = None
        self.group_by_user = None
        self.group_by_user_session = None

    def set_timeout_last_action(self, new_timeout):
        """timeout_last_action setter

        Arguments:
            new_timeout {datetime.timedelta} -- new timeout for the last action of a session
        """
        self.timeout_last_action = new_timeout

    def set_timeout_outlier(self, new_timeout):
        """timeout_outlier setter

        Arguments:
            new_timeout {datetime.timedelta} -- new timeout for outlier actions
        """
        self.timeout_outlier = new_timeout

    def set_navigation_time_lower_limit(self, new_lower_limit):
        """navigation_time setter

        Arguments:
            new_lower_limit {datetime.timedelta} -- new lower limit to filter short duration actions
        """
        self.navigation_time = new_lower_limit

    def load_logs(self, logs):
        """Load DataFrame with logs to work with

        Arguments:
            logs {pandas.core.frame.DataFrame} -- logs on which time-on-page is computed
        """
        assert type(
            logs) == pd.core.frame.DataFrame, 'logs must be type pandas.core.frame.DataFrame'
        self.logs = logs.copy().astype({'referer': 'str'})
        self.logs['time'] = pd.to_datetime(self.logs['time'])

    def logs_group_users(self):
        """Apply group by username to the logs
        """
        self.group_by_user = self.logs.groupby('username')

    def logs_group_user_session(self):
        """Apply group by username and session to the logs with the sessions of every user enumerated
        """
        self.group_by_user_session = self.user_time_session.groupby(
            ['username', 'session'])

    def __recognize_last_action(self, row):
        """Adds a category to every action according to the time between the log and
        the next log of the user. Makes use of the time limits to recognize actions.

        Arguments:
            row {pandas.core.series.Series} -- log to categorize

        Returns:
            str -- category
        """
        if pd.isnull(row['delta_time']):
            return 'last_action'
        if row['delta_time'] > self.last_action_recognize:
            return 'last_action'
        elif row['next_classification_referer'] == 'login':
            if row['delta_time'] > timedelta(minutes=10):
                return 'last_action'
        elif row['next_classification_referer'] == 'dashboard_view':
            if row['delta_time'] > timedelta(minutes=15):
                return 'last_action'
        if row['delta_time'] > self.outlier_recognize:
            return 'outlier_action'
        return 'active_session'

    def __numerate_session(self, action_type):
        """Enumerates the session of a log according to the classification given by the
        time between actions.

        Arguments:
            action_type {str} -- category of the log

        Returns:
            int -- number of session
        """
        if action_type != 'last_action':
            return self.session_number
        else:
            self.session_number += 1
            return self.session_number - 1

    def process_users(self):
        """To every group in the logs grouped by username, sorts, adds classification according
        to the time between actions and enumerates the sessions.
        """
        self.user_time_session = pd.DataFrame()
        for _, frame in self.group_by_user:
            user_frame = frame[['username', 'time', 'event_type', 'referer', 'page',
                                'classification_event_type', 'classification_referer',
                                'event', 'event_type_vertical']].copy()
            user_frame = user_frame.sort_values('time')
            user_frame[['next_time', 'next_classification_referer']] = user_frame[[
                'time', 'classification_referer']].shift(-1)
            user_frame['delta_time'] = user_frame.apply(
                lambda x: x['next_time'] - x['time'], axis=1)
            user_frame['action_type'] = user_frame.apply(
                self.__recognize_last_action, axis=1)
            self.session_number = 1
            user_frame['session'] = user_frame.action_type.apply(
                self.__numerate_session)

            self.user_time_session = pd.concat(
                [self.user_time_session, user_frame])

    def __process_extended_classification(self, event_type_vertical):
        """Adds the id of the active vertical in the log

        Arguments:
            event_type_vertical {str} -- original value of the vertical visited in the log

        Returns:
            str -- vertical visited in the log
        """
        if event_type_vertical != 'NOT_CLASSIFIED':
            self.previous_event_type = event_type_vertical
        return self.previous_event_type

    def extend_classification(self):
        """To every group in the logs grouped by username and session, adds the id of the active 
        vertical in the log, applies the timeout of the last action and sums the time on every page
        visited.
        """
        self.time_on_page = pd.DataFrame()
        for _, frame in self.group_by_user_session:
            user_and_session_frame = frame.copy()
            # EXTEND CLASSIFICATION
            self.previous_event_type = np.nan
            user_and_session_frame.event_type_vertical = user_and_session_frame.event_type_vertical.apply(
                self.__process_extended_classification)
            # TIMEOUT LAST ACTION
            if user_and_session_frame.at[user_and_session_frame.index[-1], 'event_type'] == 'page_close':
                user_and_session_frame.at[user_and_session_frame.index[-1],
                                          'delta_time'] = timedelta(0)
            else:
                # aplicar timeout de last action
                user_and_session_frame.at[user_and_session_frame.index[-1],
                                          'delta_time'] = self.timeout_last_action
            # SUM TIME PER PAGE IN THE SESSION
            tmp = self.__sum_time_per_page(user_and_session_frame)
            self.time_on_page = pd.concat([self.time_on_page, tmp])

    def __sum_time_per_page(self, df):
        """For every page visited in every session by every user, computes the total time
        that page was an active one.

        Arguments:
            df {pandas.core.frame.DataFrame} -- logs sorted by time and with the vertical visited

        Returns:
            pandas.core.frame.DataFrame -- DataFrame with time per page in the session
        """
        pages = df[~df.event_type_vertical.isna()]
        by_page_per_session = pages.groupby(pages.event_type_vertical.ne(
            pages.event_type_vertical.shift()).cumsum().rename({'event_type_vertical': 'n'}))

        time_per_page = pd.concat([by_page_per_session.username.min(),
                                   by_page_per_session.session.min(),
                                   by_page_per_session.event_type_vertical.min(),
                                   by_page_per_session.delta_time.sum()], axis=1)

        return time_per_page[~time_per_page.event_type_vertical.isna()]

    def __apply_outlier_timeout(self):
        """Apply the timeout of the outliers to those logs classified as such
        """
        self.user_time_session['delta_time'] = self.user_time_session.apply(
            lambda x: self.timeout_outlier if x['action_type'] == 'outlier_action' else x['delta_time'], axis=1)

    def __apply_navigation_lower_limit(self):
        """Removes pages visited from less time than the limit of navigation time
        """
        self.time_on_page = self.time_on_page[self.time_on_page.delta_time >=
                                              self.navigation_time]

    def do_user_time_session(self):
        """Groups users by username and runs process_users
        """
        if self.user_time_session is None:
            self.logs_group_users()
            self.process_users()

    def do_time_on_page(self, apply_outlier_timeout=True, apply_navigation_lower_limit=False):
        """Groups users by username and session, and runs extend_classification.

        Keyword Arguments:
            apply_outlier_timeout {bool}
            -- True if the timeout of the outliers must be applied (default: {True})
            apply_navigation_lower_limit {bool}
            -- True if the filter of short actions must be done (default: {False})
        """
        assert self.user_time_session is not None, 'method do_user_time_session must be run first'

        if apply_outlier_timeout:
            self.__apply_outlier_timeout()
        if self.time_on_page is None:
            self.logs_group_user_session()
            self.extend_classification()
        if apply_navigation_lower_limit:
            self.__apply_navigation_lower_limit()

    def clean_time_on_page_logs(self):
        """Removes pages with unmatched vertical_id
        """
        assert self.time_on_page is not None, 'method do_time_on_page must be run first'

        self.time_on_page = self.time_on_page.rename(
            columns={'event_type_vertical': 'vertical_id'}).reset_index()
        self.time_on_page = self.time_on_page[~((self.time_on_page.vertical_id == 'NO_MATCH') | (
            self.time_on_page.vertical_id == 'NO_VERTICAL_FOUND') | (self.time_on_page.vertical_id == 'DISCUSSION') | (
                self.time_on_page.vertical_id == 'NOT_CLASSIFIED'))]

    def write_time_on_page(self, name='time_on_page.csv'):
        """Writes the time_on_page DataFrame to a csv

        Keyword Arguments:
            name {str} -- name of the file (default: {'time_on_page.csv'})
        """
        assert self.time_on_page is not None, 'method do_time_on_page must be run first'

        self.time_on_page.to_csv(name, sep='\t')

    # For analysis

    def get_time_user_page(self):
        """Gets the total time that a user spent in a vertical

        Returns:
            pandas.core.frame.DataFrame -- total time spent by a user in a certain vertical
        """
        assert self.time_on_page is not None, 'method do_time_on_page must be run first'

        group_user_page = self.time_on_page.groupby(
            ['username', 'vertical_id'])
        user_page_total_time = group_user_page['delta_time'].sum(
        ).reset_index().rename(columns={'delta_time': 'sum'})
        user_time_describe = group_user_page['delta_time'].describe(
        ).reset_index()
        user_page_data = user_page_total_time.merge(
            user_time_describe, on=['username', 'vertical_id'])
        return user_page_data

    def get_sessions_per_user(self):
        """Gets the total sessions that a user had on the course

        Returns:
            pandas.core.frame.DataFrame -- total sessions of a user
        """
        assert self.time_on_page is not None, 'method do_time_on_page must be run first'

        sessions_per_user = self.time_on_page.groupby(['username'])[
            'session'].max()
        return pd.DataFrame(sessions_per_user).reset_index().rename(columns={'session': 'sessions'})

    def get_time_course_page(self):
        """Gets the sum of time spent by every user in a vertical

        Returns:
            pandas.core.frame.DataFrame -- sum of time spent by every user on a certain vertical
        """
        assert self.time_on_page is not None, 'method do_time_on_page must be run first'

        group_page = self.time_on_page.groupby('vertical_id')
        page_total_time = group_page['delta_time'].sum(
        ).reset_index().rename(columns={'delta_time': 'sum'})
        time_describe = group_page['delta_time'].describe().reset_index()
        page_data = page_total_time.merge(time_describe, on='vertical_id')
        return page_data
