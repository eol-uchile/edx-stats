import {
  LOADING_VISITS_ERROR,
  LOADED_VISITS_SUM,
  LOADED_VISITS_RESET,
  LOADED_VISITS_CHAPTER_SUM,
  LOADED_COMPLETIONS_SUM,
} from './reducers';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { DO_LOGIN } from '../../data/types';
import { actions } from '../../data/actions';

export const resetVisits = () => (dispatch) =>
  dispatch({ type: LOADED_VISITS_RESET });

export const recoverCourseStudentVisitSum =
  (course_id = 'nan', lower_date, upper_date, retry = 1) =>
  (dispatch, getState) => {
    let base = getState().urls.base;

    return getAuthenticatedHttpClient()
      .get(
        `${base}/api/visits/visitsoncourse/?course=${encodeURIComponent(
          course_id
        )}&time__gte=${lower_date.toISOString()}&time__lte=${upper_date.toISOString()}`
      )
      .then((res) => {
        if (res.request.responseURL.includes('login/?next=')) {
          return dispatch({ type: DO_LOGIN });
        }
        if (res.status === 200) {
          return dispatch({ type: LOADED_VISITS_SUM, data: res.data });
        }
        throw Error(
          'No hay datos para el curso para estas fechas, por favor intente mas tarde.'
        );
      })
      .catch((error) =>
        actions.manageError(
          error,
          recoverCourseStudentVisitSum,
          LOADING_VISITS_ERROR,
          dispatch,
          getState,
          retry
        )(course_id, lower_date, upper_date)
      );
  };

export const recoverDailyChapterVisits =
  (course_id, lower_date, upper_date, retry = 1) =>
  (dispatch, getState) => {
    let base = getState().urls.base;

    let parsed_course = course_id;
    if (course_id.includes('course-v1')) {
      parsed_course = course_id.replace('course-v1', 'block-v1');
    }

    return getAuthenticatedHttpClient()
      .get(
        `${base}/api/visits/visitsoncourse/daily/chapter/?course=${encodeURIComponent(
          parsed_course
        )}&time__gte=${lower_date.toISOString()}&time__lte=${upper_date.toISOString()}&limit=10000`
      )
      .then((res) => {
        if (res.request.responseURL.includes('login/?next=')) {
          return dispatch({ type: DO_LOGIN });
        }
        if (res.status === 200) {
          return dispatch({ type: LOADED_VISITS_CHAPTER_SUM, data: res.data });
        }
        throw Error(
          'No hay datos para el curso para estas fechas, por favor intente mas tarde.'
        );
      })
      .catch((error) =>
        actions.manageError(
          error,
          recoverDailyChapterVisits,
          LOADING_VISITS_ERROR,
          dispatch,
          getState,
          retry
        )(course_id, lower_date, upper_date)
      );
  };

export const recoverDailyVisits =
  (course_id, lower_date, upper_date, retry = 1) =>
  (dispatch, getState) => {
    let base = getState().urls.base;

    let parsed_course = course_id;
    if (course_id.includes('course-v1')) {
      parsed_course = course_id.replace('course-v1', 'block-v1');
    }

    return getAuthenticatedHttpClient()
      .get(
        `${base}/api/visits/visitsoncourse/daily/?course=${encodeURIComponent(
          parsed_course
        )}&time__gte=${lower_date.toISOString()}&time__lte=${upper_date.toISOString()}&limit=10000`
      )
      .then((res) => {
        if (res.request.responseURL.includes('login/?next=')) {
          return dispatch({ type: DO_LOGIN });
        }
        if (res.status === 200) {
          return dispatch({ type: LOADED_VISITS_CHAPTER_SUM, data: res.data });
        }
        throw Error(
          'No hay datos para el curso para estas fechas, por favor intente mas tarde.'
        );
      })
      .catch((error) =>
        actions.manageError(
          error,
          recoverDailyChapterVisits,
          LOADING_VISITS_ERROR,
          dispatch,
          getState,
          retry
        )(course_id, lower_date, upper_date)
      );
  };

  export const recoverCourseStudentCompletionSum =
  (course_id = 'nan', lower_date, upper_date, retry = 1) =>
  (dispatch, getState) => {
    let base = getState().urls.base;

    return getAuthenticatedHttpClient()
      .get(
        `${base}/api/visits/completionsoncourse/?course=${encodeURIComponent(
          course_id
        )}&time__gte=${lower_date.toISOString()}&time__lte=${upper_date.toISOString()}`
      )
      .then((res) => {
        if (res.request.responseURL.includes('login/?next=')) {
          return dispatch({ type: DO_LOGIN });
        }
        if (res.status === 200) {
          return dispatch({ type: LOADED_COMPLETIONS_SUM, data: res.data });
        }
        throw Error(
          'No hay datos para el curso para estas fechas, por favor intente mas tarde.'
        );
      })
      .catch((error) =>
        actions.manageError(
          error,
          recoverCourseStudentCompletionSum,
          LOADING_VISITS_ERROR,
          dispatch,
          getState,
          retry
        )(course_id, lower_date, upper_date)
      );
  };
