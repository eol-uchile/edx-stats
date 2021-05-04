import {
  LOADING_TIMES_ERROR,
  LOADED_TIMES,
  LOADING_TIMES,
  LOADED_TIMES_SUM,
  LOADED_TIMES_RESET,
} from '../types';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { manageError } from './actions';

export const resetTimes = () => (dispatch) =>
  dispatch({ type: LOADED_TIMES_RESET });

export const setLoadingTimes = () => (dispatch) =>
  dispatch({ type: LOADING_TIMES });

export const recoverCourseStudentTimes = (
  course_id = 'nan',
  offset = 0,
  limit = 25,
  extra = '',
  retry = 1
) => (dispatch, getState) => {
  let base = getState().urls.base;
  return getAuthenticatedHttpClient()
    .get(
      `${base}/api/times/timeonpage/?course=${encodeURIComponent(
        course_id
      )}&offset=${offset}&limit=${limit}${extra}`
    )
    .then((res) => {
      if (res.request.responseURL.includes('login/?next=')) {
        return dispatch({ type: DO_LOGIN });
      }
      if (res.status === 200) {
        return dispatch({ type: LOADED_TIMES, data: res.data.results });
      }
      throw Error('No hay datos para el curso, por favor intente mas tarde.');
    })
    .catch((error) =>
      manageError(
        error,
        recoverCourseStudentTimes,
        LOADING_TIMES_ERROR,
        dispatch,
        getState,
        retry
      )(course_id, offset, limit, extra)
    );
};

export const recoverCourseStudentTimesSum = (
  course_id = 'nan',
  lower_date,
  upper_date,
  retry = 1
) => (dispatch, getState) => {
  let base = getState().urls.base;

  return getAuthenticatedHttpClient()
    .get(
      `${base}/api/times/timeoncourse/?course=${encodeURIComponent(
        course_id
      )}&time__gte=${lower_date.toISOString()}&time__lte=${upper_date.toISOString()}`
    )
    .then((res) => {
      if (res.request.responseURL.includes('login/?next=')) {
        return dispatch({ type: DO_LOGIN });
      }
      if (res.status === 200) {
        return dispatch({ type: LOADED_TIMES_SUM, data: res.data });
      }
      throw Error(
        'No hay datos para el curso para estas fechas, por favor intente mas tarde.'
      );
    })
    .catch((error) =>
      manageError(
        error,
        recoverCourseStudentTimesSum,
        LOADING_TIMES_ERROR,
        dispatch,
        getState
      )(course_id, lower_date, upper_date)
    );
};
