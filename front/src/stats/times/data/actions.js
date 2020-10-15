import {
  LOADED_TIMES,
  LOADED_COURSE,
  LOADING_TIMES_ERROR,
  LOADING_COURSE,
  LOADING_TIMES,
  LOADED_TIMES_SUM,
  LOADING_COURSE_ERROR,
  DO_LOGIN,
  LOADED_TIMES_RESET,
  LOADED_COURSE_RESET,
  LOADED_COURSE_ROLES,
  LOADED_COURSE_ROLES_ERROR,
  REFRESH_LOGIN,
} from './types';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const resetCourses = () => (dispatch) =>
  dispatch({ type: LOADED_COURSE_RESET });

export const setLoadingCourse = () => (dispatch) =>
  dispatch({ type: LOADING_COURSE });

export const recoverCourseStudentTimes = (
  course_id = 'nan',
  offset = 0,
  limit = 25,
  extra = ''
) => (dispatch, getState) => {
  let base = getState().urls.base;
  getAuthenticatedHttpClient()
    .get(
      `${base}/api/courses/timeonpage/?course=${encodeURIComponent(
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
      return dispatch({ type: LOADING_TIMES_ERROR, data: [] });
    })
    .catch((error) => dispatch({ type: LOADING_TIMES_ERROR, data: [] }));
};

export const getUserCourseRoles = () => (dispatch, getState) => {
  let lms = getState().urls.lms;
  getAuthenticatedHttpClient()
    .get(`${lms}/api/enrollment/v1/roles/`)
    .then((res) => {
      if (res.request.responseURL.includes('login/?next=')) {
        return dispatch({ type: DO_LOGIN });
      }
      if (res.status === 200) {
        return dispatch({ type: LOADED_COURSE_ROLES, data: res.data.roles });
      }
      return dispatch({ type: LOADED_COURSE_ROLES_ERROR, data: [] });
    })
    .catch((error) => dispatch({ type: LOADED_COURSE_ROLES_ERROR, data: [] }));
};

export const recoverCourseStructure = (course_id = 'nan') => (
  dispatch,
  getState
) => {
  let base = getState().urls.base;

  getAuthenticatedHttpClient()
    .get(
      `/api/courses/course-structure/?search=${encodeURIComponent(course_id)}`
    )
    .then((res) => {
      if (res.request.responseURL.includes('login/?next=')) {
        return dispatch({ type: DO_LOGIN });
      }
      if (res.status === 200) {
        return dispatch({ type: LOADED_COURSE, data: [res.data.courses[0]] });
      }
      return dispatch({ type: LOADING_COURSE_ERROR, data: [] });
    })
    .catch((error) => {
      let msg = error.customAttributes
        ? error.customAttributes.httpErrorResponseData
        : undefined;
      if (msg === undefined) {
        msg = 'Hubo un error en el servidor';
      }
      dispatch({
        type: LOADING_COURSE_ERROR,
        data: [msg],
      });
    });
};

export const resetTimes = () => (dispatch) =>
  dispatch({ type: LOADED_TIMES_RESET });

export const setLoadingTimes = () => (dispatch) =>
  dispatch({ type: LOADING_TIMES });

export const recoverCourseStudentTimesSum = (
  course_id = 'nan',
  lower_date,
  upper_date
) => (dispatch, getState) => {
  let base = getState().urls.base;

  getAuthenticatedHttpClient()
    .get(
      `${base}/api/courses/times/?search=${encodeURIComponent(
        course_id
      )}&llimit=${lower_date.toISOString()}&ulimit=${upper_date.toISOString()}`
    )
    .then((res) => {
      if (res.request.responseURL.includes('login/?next=')) {
        return dispatch({ type: DO_LOGIN });
      }
      if (res.status === 200) {
        return dispatch({ type: LOADED_TIMES_SUM, data: res.data });
      }
      return dispatch({ type: LOADING_TIMES_ERROR, data: [] });
    })
    .catch((error) => {
      let msg = error.customAttributes
        ? error.customAttributes.httpErrorResponseData
        : undefined;
      if (msg === undefined) {
        msg = 'Hubo un error en el servidor';
      }
      dispatch({ type: LOADING_TIMES_ERROR, data: [msg] });
    });
};

export const refreshTokens = () => (dispatch, getState) => {
  let lms = getState().urls.lms;
  getAuthenticatedHttpClient()
    .post(`${lms}/login_refresh`)
    .then((res) => {
      if (res.status === 200) {
        return dispatch({ type: REFRESH_LOGIN });
      }
      return dispatch({ type: LOADING_TIMES_ERROR, data: ['what'] });
    })
    .catch((error) => dispatch({ type: LOADING_TIMES_ERROR, data: [] }));
};
