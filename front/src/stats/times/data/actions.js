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
} from './types';

export const resetCourses = () => (dispatch) =>
  dispatch({ type: LOADED_COURSE_RESET });

export const setLoadingCourse = () => (dispatch) =>
  dispatch({ type: LOADING_COURSE });

export const recoverCourseStudentTimes = (
  course_id = 'nan',
  offset = 0,
  limit = 25,
  extra = '',
) => (dispatch, getState) => {
  let base = getState().urls.base;
  fetch(
    `${base}/api/courses/timeonpage/?course=${encodeURIComponent(
      course_id,
    )}&offset=${offset}&limit=${limit}${extra}`,
    {
      credentials: 'include',
    },
  ).then((res) => {
    const response = res;
    if (res.status === 200) {
      return response
        .json()
        .then((data) => dispatch({ type: LOADED_TIMES, data: data.results }));
    }
    return dispatch({ type: LOADING_TIMES_ERROR, data: [] });
  });
};

export const getUserCourseRoles = () => (dispatch, getState) => {
  let lms = getState().urls.lms;
  fetch(`${lms}/api/enrollment/v1/roles/`, {
    credentials: 'include',
  }).then((res) => {
    const response = res;

    if (res.url.includes('login/?next=')) {
      return dispatch({ type: DO_LOGIN });
    }
    if (res.status === 200) {
      return response
        .json()
        .then((data) =>
          dispatch({ type: LOADED_COURSE_ROLES, data: data.roles }),
        );
    }
    return dispatch({ type: LOADED_COURSE_ROLES_ERROR, data: [] });
  });
};

export const recoverCourseStructure = (course_id = 'nan') => (
  dispatch,
  getState,
) => {
  let base = getState().urls.base;
  let headers = {
    HTTP_AUTHORIZATION: 'jwt',
  };
  fetch(
    `${base}/api/courses/course-structure/?search=${encodeURIComponent(
      course_id,
    )}`,
    {
      credentials: 'include',
      headers,
    },
  ).then((res) => {
    const response = res;

    if (res.url.includes('login/?next=')) {
      return dispatch({ type: DO_LOGIN });
    }
    if (res.status === 200) {
      return response
        .json()
        .then((data) =>
          dispatch({ type: LOADED_COURSE, data: [data.courses[0]] }),
        );
    }
    return dispatch({ type: LOADING_COURSE_ERROR, data: [] });
  });
};

export const resetTimes = () => (dispatch) =>
  dispatch({ type: LOADED_TIMES_RESET });

export const setLoadingTimes = () => (dispatch) =>
  dispatch({ type: LOADING_TIMES });

export const recoverCourseStudentTimesSum = (course_id = 'nan') => (
  dispatch,
  getState,
) => {
  let base = getState().urls.base;
  let headers = {
    HTTP_AUTHORIZATION: 'jwt',
  };
  fetch(`${base}/api/courses/times/?search=${encodeURIComponent(course_id)}`, {
    credentials: 'include',
    headers,
  }).then((res) => {
    const response = res;

    if (res.url.includes('login/?next=')) {
      return dispatch({ type: DO_LOGIN });
    }
    if (res.status === 200) {
      return response
        .json()
        .then((data) => dispatch({ type: LOADED_TIMES_SUM, data }));
    }
    return dispatch({ type: LOADING_TIMES_ERROR, data: [] });
  });
};
