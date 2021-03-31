import {
  DO_LOGIN,
  LOADING_VISITS_ERROR,
  LOADED_VISITS_SUM,
  LOADED_VISITS_RESET,
  LOADED_VISITS_CHAPTER_SUM,
} from '../types';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const resetVisits = () => (dispatch) =>
  dispatch({ type: LOADED_VISITS_RESET });

export const recoverCourseStudentVisitSum = (
  course_id = 'nan',
  lower_date,
  upper_date
) => (dispatch, getState) => {
  let base = getState().urls.base;

  getAuthenticatedHttpClient()
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
      return dispatch({
        type: LOADING_VISITS_ERROR,
        data: [
          'No hay datos para el curso para estas fechas, por favor intente mas tarde.',
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
      dispatch({ type: LOADING_VISITS_ERROR, data: [msg] });
    });
};

export const recoverDailyChapterVisits = (
  course_id,
  lower_date,
  upper_date
) => (dispatch, getState) => {
  let base = getState().urls.base;

  let parsed_course = course_id;
  if (course_id.includes('course-v1')) {
    parsed_course = course_id.replace('course-v1', 'block-v1');
  }

  getAuthenticatedHttpClient()
    .get(
      `${base}/api/visits/daily-visitsoncourse/?course=${encodeURIComponent(
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
      return dispatch({
        type: LOADING_VISITS_ERROR,
        data: [
          'No hay datos para el curso para estas fechas, por favor intente mas tarde.',
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
      dispatch({ type: LOADING_VISITS_ERROR, data: [msg] });
    });
};
