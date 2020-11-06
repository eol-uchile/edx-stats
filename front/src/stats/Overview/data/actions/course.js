import {
  LOADED_COURSE,
  LOADING_COURSE,
  LOADING_COURSE_ERROR,
  LOADED_COURSE_RESET,
  LOADED_COURSE_ROLES,
  LOADED_COURSE_ROLES_ERROR,
  LOADED_COURSES_INFO,
  LOADED_COURSES_INFO_ERROR,
  RESET_COURSE_STRUCTURE,
} from '../types';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const resetCourses = () => (dispatch) =>
  dispatch({ type: LOADED_COURSE_RESET });

export const resetCourseStructure = () => (dispatch) =>
  dispatch({ type: RESET_COURSE_STRUCTURE });

export const setLoadingCourse = (prop) => (dispatch) =>
  dispatch({ type: LOADING_COURSE, data: prop });

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
      return dispatch({ type: LOADED_COURSE_ROLES_ERROR, data: [res.status] });
    })
    .catch((error) =>
      dispatch({
        type: LOADED_COURSE_ROLES_ERROR,
        data: [
          'Hubo un error al obtener sus cursos. Por favor intente más tarde.',
        ],
      })
    );
};

export const recoverCourseStructure = (course_id = 'nan') => (
  dispatch,
  getState
) => {
  let base = getState().urls.base;

  getAuthenticatedHttpClient()
    .get(
      `${base}/api/core/course-structure/?search=${encodeURIComponent(
        course_id
      )}`
    )
    .then((res) => {
      if (res.request.responseURL.includes('login/?next=')) {
        return dispatch({ type: DO_LOGIN });
      }
      if (res.status === 200) {
        return dispatch({ type: LOADED_COURSE, data: [res.data.courses[0]] });
      }
      return dispatch({
        type: LOADING_COURSE_ERROR,
        data: [
          'El curso no ha sido ingresado al sistema de analítica, por favor intente mas tarde.',
        ],
      });
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

export const recoverCourseStructureFromCMS = (course_id = 'nan') => (
  dispatch,
  getState
) => {
  let cms = getState().urls.cms;
  getAuthenticatedHttpClient()
    .get(`${cms}/course/${encodeURIComponent(course_id)}?format=concise`, {
      headers: { Accept: 'application/json, text/plain, */*' },
    })
    .then((res) => {
      if (res.request.responseURL.includes('login/?next=')) {
        return dispatch({ type: DO_LOGIN });
      }
      if (res.status === 200) {
        return dispatch({ type: LOADED_COURSE, data: [res.data.courses[0]] });
      }
      return dispatch({
        type: LOADING_COURSE_ERROR,
        data: [
          'El curso no ha sido ingresado al sistema de analítica, por favor intente mas tarde.',
        ],
      });
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

export const getEnrolledCourses = () => (dispatch, getState) => {
  let lms = getState().urls.lms;
  getAuthenticatedHttpClient()
    .get(`${lms}/api/courses/v1/courses/?page_size=200`)
    .then((res) => {
      if (res.status === 200) {
        return dispatch({ type: LOADED_COURSES_INFO, data: res.data.results });
      }
      return dispatch({
        type: LOADED_COURSES_INFO_ERROR,
        data: [
          'Hubo un error al obtener la información de los cursos. Por favor intente más tarde.',
        ],
      });
    })
    .catch((error) =>
      dispatch({
        type: LOADED_COURSES_INFO_ERROR,
        data: [
          'Hubo un error al obtener la información de los cursos. Por favor intente más tarde.',
        ],
      })
    );
};
