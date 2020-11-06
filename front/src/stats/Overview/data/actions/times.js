import {
  LOADING_TIMES_ERROR,
  LOADED_TIMES,
  LOADING_TIMES,
  LOADED_TIMES_SUM,
  LOADED_TIMES_RESET,
} from '../types';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const resetTimes = () => (dispatch) =>
  dispatch({ type: LOADED_TIMES_RESET });

export const setLoadingTimes = () => (dispatch) =>
  dispatch({ type: LOADING_TIMES });

export const recoverCourseStudentTimes = (
  course_id = 'nan',
  offset = 0,
  limit = 25,
  extra = ''
) => (dispatch, getState) => {
  let base = getState().urls.base;
  getAuthenticatedHttpClient()
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
      return dispatch({
        type: LOADING_TIMES_ERROR,
        data: ['No hay datos para el curso, por favor intente mas tarde.'],
      });
    })
    .catch((error) =>
      dispatch({
        type: LOADING_TIMES_ERROR,
        data: ['Ha ocurrido un error en los servidores de Eol.'],
      })
    );
};

export const recoverCourseStudentTimesSum = (
  course_id = 'nan',
  lower_date,
  upper_date
) => (dispatch, getState) => {
  let base = getState().urls.base;

  getAuthenticatedHttpClient()
    .get(
      `${base}/api/times/timeoncourse/?search=${encodeURIComponent(
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
      return dispatch({
        type: LOADING_TIMES_ERROR,
        data: [
          'No hay datos para el curso para estas fechas, por favor intente mas tarde.',
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
      dispatch({ type: LOADING_TIMES_ERROR, data: [msg] });
    });
};
