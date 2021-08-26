import {
  LOADED_VIDEOS_RESET,
  LOADED_VIDEOS,
  LOADED_VIEWS_SUM,
  LOADED_COVERAGE,
  LOADING_VIEWS_ERROR,
} from './reducers';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { DO_LOGIN } from '../../data/types';
import { actions } from '../../data/actions';

export const resetVideos = () => (dispatch) =>
  dispatch({ type: LOADED_VIDEOS_RESET });

export const recoverVideos =
  (course_id = 'nan', retry = 1) =>
    (dispatch, getState) => {
      let base = getState().urls.base;

      return getAuthenticatedHttpClient()
        .get(
          `${base}/api/videos/all/?course=${encodeURIComponent(
            course_id
          )}`
        )
        .then((res) => {
          if (res.request.responseURL.includes('login/?next=')) {
            return dispatch({ type: DO_LOGIN });
          }
          if (res.status === 200) {
            return dispatch({ type: LOADED_VIDEOS, data: res.data })
          }
          throw Error(
            'No hay datos para el curso para estas fechas, por favor intente mas tarde.'
          );
        })
        .catch((error) =>
          actions.manageError(
            error,
            recoverVideos,
            LOADING_VIEWS_ERROR,
            dispatch,
            getState
          )(course_id)
        );
    };

export const recoverViewSum =
  (course_id = 'nan', lower_date, upper_date, retry = 1) =>
    (dispatch, getState) => {
      let base = getState().urls.base;

      return getAuthenticatedHttpClient()
        .get(
          `${base}/api/videos/viewsonvideos/?course=${encodeURIComponent(
            course_id
          )}&time__gte=${lower_date.toISOString()}&time__lte=${upper_date.toISOString()}`
        )
        .then((res) => {
          if (res.request.responseURL.includes('login/?next=')) {
            return dispatch({ type: DO_LOGIN });
          }
          if (res.status === 200) {
            return dispatch({ type: LOADED_VIEWS_SUM, data: res.data })
          }
          throw Error(
            'No hay datos para el curso para estas fechas, por favor intente mas tarde.'
          );
        })
        .catch((error) =>
          actions.manageError(
            error,
            recoverViewSum,
            LOADING_VIEWS_ERROR,
            dispatch,
            getState
          )(course_id, lower_date, upper_date)
        );
    };

export const recoverCoverage =
  (course_id = 'nan', lower_date, upper_date, retry = 1) =>
    (dispatch, getState) => {
      let base = getState().urls.base;

      return getAuthenticatedHttpClient()
        .get(
          `${base}/api/videos/coverage/?course=${encodeURIComponent(
            course_id
          )}&time__gte=${lower_date.toISOString()}&time__lte=${upper_date.toISOString()}`
        )
        .then((res) => {
          if (res.request.responseURL.includes('login/?next=')) {
            return dispatch({ type: DO_LOGIN });
          }
          if (res.status === 200) {
            return dispatch({ type: LOADED_COVERAGE, data: res.data })
          }
          throw Error(
            'No hay datos para el curso para estas fechas, por favor intente mas tarde.'
          );
        })
        .catch((error) =>
          actions.manageError(
            error,
            recoverCoverage,
            LOADING_VIEWS_ERROR,
            dispatch,
            getState
          )(course_id, lower_date, upper_date)
        );
    };