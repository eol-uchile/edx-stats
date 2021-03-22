import {
  DO_LOGIN,
  LOADING_VISITS_ERROR,
  LOADED_VISITS_SUM,
  LOADED_VISITS_RESET,
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
      `${base}/api/visits/visitsoncourse/?search=${encodeURIComponent(
        course_id
      )}&llimit=${lower_date.toISOString()}&ulimit=${upper_date.toISOString()}`
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
