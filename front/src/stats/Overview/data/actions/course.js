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

/**
 * Recover role info and from it each individual course's data
 * @returns Thunk
 */
export const initCourseRolesInfo = () => (dispatch, getState) => {
  let lms = getState().urls.lms;
  let discovery = getState().urls.discovery;

  const course_request = `${discovery}/api/v1/course_runs/`;

  // Set loading for general info
  dispatch({ type: LOADING_COURSE, data: 'status' });

  return getAuthenticatedHttpClient()
    .get(`${lms}/api/enrollment/v1/roles/`)
    .then((res) => {
      if (res.request.responseURL.includes('login/?next=')) {
        return dispatch({ type: DO_LOGIN });
      }
      if (res.status === 200) {
        // Merge course roles on redudant data
        let courses = {};
        res.data.roles.forEach((element) => {
          if (element.course_id in courses) {
            courses[element.course_id].push(element.role);
          } else {
            courses[element.course_id] = [element.role];
          }
        });
        let course_roles = Object.keys(courses).map((k) => ({
          course_id: k,
          roles: courses[k],
        }));

        dispatch({ type: LOADED_COURSE_ROLES, data: course_roles });
        if (course_roles.length > 0) {
          return getAuthenticatedHttpClient()
            .get(
              `${course_request}?keys=${encodeURIComponent(
                course_roles.map((el) => el.course_id).join(',')
              )}`
            )
            .then((res) => {
              if (res.status === 200) {
                // We are done
                return dispatch({
                  type: LOADED_COURSES_INFO,
                  data: [...res.data.results],
                });
              }
              throw Error(LOADED_COURSES_INFO_ERROR);
            });
        } else {
          return dispatch({ type: LOADED_COURSES_INFO, data: [] });
        }
      }
      throw Error;
    })
    .catch((e) => {
      dispatch({
        type:
          e === LOADED_COURSES_INFO_ERROR
            ? LOADED_COURSES_INFO_ERROR
            : LOADED_COURSE_ROLES_ERROR,
        data: [
          'Hubo un error al obtener sus cursos. Por favor intente más tarde.',
        ],
      });
    });
};

export const recoverCourseStructure = (course_id = 'nan') => (
  dispatch,
  getState
) => {
  let base = getState().urls.base;

  dispatch({ type: LOADING_COURSE, data: 'course_status' });

  return getAuthenticatedHttpClient()
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
      if (msg === undefined || error.customAttributes.httpErrorStatus === 502) {
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
  return getAuthenticatedHttpClient()
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
      if (msg === undefined || error.customAttributes.httpErrorStatus === 502) {
        msg = 'Hubo un error en el servidor';
      }
      dispatch({
        type: LOADING_COURSE_ERROR,
        data: [msg],
      });
    });
};

/**
 * Recover recursively all course_runs
 * @param {*} offset
 * @returns Thunk
 */
export const getEnrolledCourses = (offset = 0) => (dispatch, getState) => {
  const baserequest = `${discovery}/api/v1/course_runs/?format=json&limit=200&offset=`;

  let reduceAPIResponse = (prev, dispatch, off_set, base_request) =>
    getAuthenticatedHttpClient()
      .get(`${base_request}${off_set}`)
      .then((res) => {
        if (res.status === 200) {
          // Check count
          if (res.data.next !== null) {
            // Merge both
            let reduced = {
              count: res.data.count,
              results: [...res.data.results, ...prev.results],
            };
            return reduceAPIResponse(
              reduced,
              dispatch,
              off_set + res.data.results.length,
              base_request
            );
          } else {
            // We are done
            let merged =
              prev === null
                ? res.data
                : {
                    count: res.data.count,
                    results: [...res.data.results, ...prev.results],
                  };
            return dispatch({ type: LOADED_COURSES_INFO, data: merged });
          }
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

  return reduceAPIResponse(
    { results: [], count: 0 },
    dispatch,
    offset,
    baserequest
  );
};
