import {
  LOADED_TIMES,
  LOADED_COURSE,
  LOADING_TIMES_ERROR,
  LOADING_COURSE,
  LOADING_TIMES,
  LOADING_COURSE_ERROR,
} from './types';

export const setLoadingCourse = () => (dispatch) =>
  dispatch({ type: LOADING_COURSE });

export const recoverCourseStudentTimes = (
  course_id = 'nan',
  offset = 0,
  limit = 25,
  extra = '',
) => (dispatch) => {
  fetch(
    `/api/courses/timeonpagesds/?course=${course_id}&offset=${offset}&limit=${limit}${extra}`,
  ).then((res) => {
    const response = res;
    if (res.status === 200) {
      return response
        .json()
        .then((data) => dispatch({ type: LOADED_TIMES, data }));
    }
    return dispatch({ type: LOADING_TIMES_ERROR });
  });
};

export const setLoadingTimes = () => (dispatch) =>
  dispatch({ type: LOADING_TIMES });

export const recoverCourseStructure = (
  course_id = 'nan',
  offset = 0,
  limit = 100,
  extra = '',
) => (dispatch) => {
  fetch(
    `/api/courses/vertical/?search=${course_id}&offset=${offset}&limit=${limit}${extra}`,
  ).then((res) => {
    const response = res;
    if (res.status === 200) {
      return response
        .json()
        .then((data) => dispatch({ type: LOADED_COURSE, data }));
    }
    return dispatch({ type: LOADING_COURSE_ERROR });
  });
};
