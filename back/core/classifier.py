import re
import json
import pandas as pd
import numpy as np
import logging
import datetime

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

logger = logging.getLogger(__name__)


class LogParser:
    """LogParser Class
    Parse logs from edX with type of event and page/vertical id
    """

    def __init__(self, course_filepath="", df=None, run_code=None):
        """LogParser class constructor

        Arguments:
            course_filepath {str} -- file path of the course structure
            df {Dataframe} -- Optional processed pandas dataframe
        """
        self.course_filepath = course_filepath
        if course_filepath == "":
            self.course = df
        else:
            self.course = pd.read_csv(self.course_filepath, sep='\t')
        if run_code is None:
            self.run_code = str(datetime.date.today())
        else:
            self.run_code = run_code

    def debug_course_id(self, id):
        """
        Store course structure and problematic id
        """
        try:
            self.course.to_csv("Course-{}.csv".format(self.course.course_name.iloc[0],self.run_code), index=False)
            with open("Error-ids-{}-{}.log".format(self.course.course_name.iloc[0],self.run_code), 'a') as f:
                f.write(id+'\n')
        except Exception:
            logger.warning("!hola", exc_info=True)

    def load_logs(self, logs):
        """Load DataFrame with logs to parse

        Arguments:
            logs {pandas.core.frame.DataFrame} -- logs to parse
        """
        assert type(logs) == pd.core.frame.DataFrame, \
            'logs must be type pandas.core.frame.DataFrame'

        self.logs = logs.copy().astype({'referer': 'str'})
        self.logs['time'] = pd.to_datetime(self.logs['time'])

    def load_logs_from_file(self, logs_filepath):
        """Load DataFrame with logs to parse from the file

        Arguments:
            logs_filepath {str} -- file path of the logs
        """
        self.load_logs(pd.read_csv(logs_filepath, sep='\t'))

    def parse_event_type(self, event_type):
        """Parse (with regex) the event_type value of a log to classify it

        Arguments:
            event_type {str} -- string to parse/classify

        Returns:
            str -- classification
        """
        if re_page_view_courseware.search(event_type):
            return 'page_view'
        elif re_page_view_course.search(event_type):
            return 'course_view'
        elif re_wiki_view.search(event_type):
            return 'wiki_view'
        elif re_progress_view.search(event_type):
            return 'progress_view'
        elif re_bookmarks_view.search(event_type):
            return 'bookmarks_view'
        elif re_forum_view.search(event_type):
            return 'forum_view'
        elif re_forum_view_user_profile.search(event_type):
            return 'forum_view_user_profile'
        elif re_forum_thread_view.search(event_type):
            return 'forum_thread_view'
        elif re_next_vertical.search(event_type):
            return 'next_vertical'
        elif re_next_sequence.search(event_type):
            return 'next_sequence_first_vertical'
        elif re_previous_vertical.search(event_type):
            return 'previous_vertical'
        elif re_previous_sequence.search(event_type):
            return 'previous_sequence_last_vertical'
        elif re_goto_vertical.search(event_type):
            return 'goto_vertical'
        else:
            return 'not_classified'

    def parse_referer(self, referer):
        """Parse (with regex) the referer value of a log to classify it

        Arguments:
            referer {str} -- string to parse/classify

        Returns:
            str -- classification
        """
        if re_from_dashboard.search(referer):
            return 'dashboard_view'
        elif re_from_login.search(referer):
            return 'login'
        elif re_page_view_courseware.search(referer):
            return 'page_view'
        elif re_page_view_course.search(referer):
            return 'course_view'
        elif re_wiki_view.search(referer):
            return 'wiki_view'
        elif re_progress_view.search(referer):
            return 'progress_view'
        elif re_bookmarks_view.search(referer):
            return 'bookmarks_view'
        elif re_forum_view.search(referer):
            return 'forum_view'
        elif re_forum_view_user_profile.search(referer):
            return 'forum_view_user_profile'
        elif re_forum_thread_view.search(referer):
            return 'forum_thread_view'
        else:
            return 'not_classified'

    def parse_logs(self):
        """Add classification of the event_type and referer value of a log
        and add the vertical id of the page visited on it
        """
        self.logs['classification_event_type'] = self.logs.event_type.apply(
            self.parse_event_type)
        self.logs['classification_referer'] = self.logs.referer.apply(
            self.parse_referer)
        self.logs['event_type_vertical'] = self.logs.apply(
            self.__add_vertical_id, axis=1)

    def parse_and_get_logs(self):
        """Parse and return (parsed) logs

        Returns:
            pandas.core.frame.DataFrame -- logs parsed
        """
        self.parse_logs()
        return self.logs

    def __get_page(self, chapter, sequential, vertical):
        """Gets the row of the course structure DataFrame that matches the
        chapter, sequential and vertical id. If the vertical id is greater
        than the max vertical id, the real value is 1.

        Arguments:
            chapter {str} -- id of the chapter
            sequential {str} -- id of the sequential
            vertical {str} -- id of the vertical

        Returns:
            pandas.core.frame.DataFrame
            -- rows from the course df that matches the condition
        """
        condition = ((self.course.chapter.str.contains(chapter)) &
                     (self.course.sequential.str.contains(sequential)))

        max_vertical = max(self.course[condition]['vertical_number'])
        vertical_number = 1 if int(vertical) > max_vertical else int(vertical)

        condition = ((self.course.chapter.str.contains(chapter)) &
                     (self.course.sequential.str.contains(sequential)) &
                     (self.course.vertical_number == vertical_number))

        return self.course[condition]

    def __add_vertical_id(self, row):
        """Given a row from the logs, adds the vertical id of the page visited according
        to the classification of event_type

        Arguments:
            row {pandas.core.series.Series} -- log to which the id of the vertical is added

        Returns:
            str -- id of the vertical visited in the log
        """
        try:
            cet = row['classification_event_type']
            if cet == 'page_view':
                path = row['event_type'].split('courseware')[1]
                path = path[:-1].split("/") if path[-1] == "/" else path.split("/")
                chapter = sequential = vertical = ''
                chapter = path[1]
                sequential = path[2]
                try:
                    vertical = path[3]
                except IndexError:
                    vertical = '1'
                try:
                    tmp_course = self.__get_page(chapter, sequential, vertical)
                    return tmp_course['vertical'].iloc[0]
                except Exception:
                    # no valid id
                    return "NOT_LISTED"

            elif cet == 'forum_thread_view':
                try:
                    discussion_id = row['event_type'].split('forum')[
                        1].split("/")[1]

                    tmp_course = self.course[self.course.discussion_id ==
                                            discussion_id]

                    return tmp_course['vertical'].iloc[0]
                    # si se quisiera ser mas especifico, cambiar el return por discussion_id
                except AttributeError:
                    return 'DISCUSSION'

            elif cet == 'next_vertical':
                return self.__get_next_vertical(row['event'])

            elif cet == 'next_sequence_first_vertical':
                return self.__get_next_sequence_first_vertical(row['event'])

            elif cet == 'previous_vertical':
                return self.__get_previous_vertical(row['event'])

            elif cet == 'previous_sequence_last_vertical':
                return self.__get_previous_sequence_last_vertical(row['event'])

            elif cet == 'goto_vertical':
                return self.__get_goto_vertical(row['event'])

            elif cet == 'not_classified':
                return 'NOT_CLASSIFIED'

            else:
                # course_view has no classifications yet
                return np.nan
        except IndexError:
            event = json.loads(row['event'])['id']
            self.debug_course_id(event)
            logger.warning("Pandas coundn't find index for event: {} - {}".format(cet, event))
            return np.nan
        except Exception:
            logger.warning("Unforseen exception, event: {}, skipping row".format(cet))
            return np.nan

    def __get_next_vertical(self, event):
        """Given an event from the logs, matches the sequential and next vertical number
        with the data from the course to get the vertical id.

        Arguments:
            event {str} -- event of the event_type seq_next

        Returns:
            str -- vertical id
        """
        # get the next vertical in the same sequential
        json_sequence = json.loads(event)
        sequential = json_sequence['id']
        next_vertical_number = json_sequence['new']
        actual_vertical_number = json_sequence['old']
        assert next_vertical_number == actual_vertical_number + \
            1, 'actual vertical number must be 1 lower than next_vertical_number'
        
        try:
            row_next_vertical = self.course[((self.course.vertical_number == next_vertical_number) & (
                self.course.sequential == sequential))].iloc[0]
            return row_next_vertical['vertical']
        except IndexError:
            return 'NO_VERTICAL_FOUND'

    def __get_previous_vertical(self, event):
        """Given an event from the logs, matches the sequential and previous vertical number
        with the data from the course to get the vertical id.

        Arguments:
            event {str} -- event of the event_type seq_prev

        Returns:
            str -- vertical id
        """
        # get previous vertical in the same sequential
        json_sequence = json.loads(event)
        sequential = json_sequence['id']
        previous_vertical_number = json_sequence['new']
        actual_vertical_number = json_sequence['old']
        assert previous_vertical_number == actual_vertical_number - \
            1, 'actual vertical number must be 1 greater than previous_vertical_number'
        try:
            row_previous_vertical = self.course[((self.course.vertical_number == previous_vertical_number) & (
                self.course.sequential == sequential))].iloc[0]
            return row_previous_vertical['vertical']
        except IndexError:
            return 'NO_VERTICAL_FOUND'

    def __get_next_sequence_first_vertical(self, event):
        """Given an event from the logs, matches the sequential, gets the first vertical
        of the next sequential and matches it with the data from the course to get its id.
        If the sequential is the last of its chapter, gets the first vertical of the first
        sequential of the next chapter.

        Arguments:
            event {str} -- event of the event_type edx.ui.lms.sequence.next_selected

        Returns:
            str -- vertical id
        """
        # get the first vertical of the next sequential
        json_sequence = json.loads(event)
        sequential = json_sequence['id']
        row = self.course[self.course.sequential == sequential].iloc[0]
        chapter = row['chapter']  # chapter actual
        next_sequential_number = row['sequential_number'] + 1
        try:
            # caso en que hay un sequential mas en ese chapter
            row_next = self.course[((self.course.vertical_number == 1) & (
                self.course.sequential_number == next_sequential_number) & (self.course.chapter == chapter))].iloc[0]
        except IndexError:
            # caso que era el ultimo sequential del chapter
            next_chapter_number = row['chapter_number'] + 1
            row_next = self.course[((self.course.vertical_number == 1) & (
                self.course.sequential_number == 1) & (self.course.chapter_number == next_chapter_number))].iloc[0]
        return row_next['vertical']

    def __get_previous_sequence_last_vertical(self, event):
        """Given an event from the logs, matches the sequential, gets the last vertical
        of the previous sequential and matches it with the data from the course to get its id.
        If the sequential is the first of its chapter, gets the last vertical of the last
        sequential of the previous chapter.

        Arguments:
            event {str} -- event of the event_type edx.ui.lms.sequence.previous_selected

        Returns:
            str -- vertical id
        """
        # get the last vertical of the previous sequential
        json_sequence = json.loads(event)
        sequential = json_sequence['id']
        row = self.course[self.course.sequential == sequential].iloc[0]
        chapter = row['chapter']  # chapter actual
        previous_sequential_number = row['sequential_number'] - 1

        if previous_sequential_number <= 0:
            # maximo vertical y maximo sequential del chapter anterior
            previous_chapter_number = row['chapter_number'] - 1
            previous_chapter = self.course[self.course.chapter_number ==
                                           previous_chapter_number]
            previous_sequential = previous_chapter[previous_chapter.sequential_number ==
                                                   previous_chapter.sequential_number.max()]
        else:
            # buscar el maximo vertical del sequentaial
            previous_sequential = self.course[(
                (self.course.sequential_number == previous_sequential_number) & (self.course.chapter == chapter))]

        last_vertical_previous_sequential = previous_sequential.loc[previous_sequential.vertical_number.idxmax(
        )]
        return last_vertical_previous_sequential['vertical']

    def __get_goto_vertical(self, event):
        """Given an event from the logs, matches the sequential, gets the indicated vertical
        on it and matches it with the data from the course to get its id.

        Arguments:
            event {str} -- event of the event_type seq_goto

        Returns:
            str -- vertical id
        """
        json_sequence = json.loads(event)
        sequential = json_sequence['id']  # id
        goto_vertical_number = json_sequence['new']  # new
        try:
            row_goto_vertical = self.course[((self.course.vertical_number == goto_vertical_number) & (
                self.course.sequential == sequential))].iloc[0]
            return row_goto_vertical['vertical']
        except IndexError:
            return 'NO_VERTICAL_FOUND'