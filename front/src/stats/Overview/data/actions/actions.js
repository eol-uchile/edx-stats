import { REFRESH_LOGIN, D_SET_SELECTED_COURSE, CLEAN_ERRORS } from '../types';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

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

export const setSelectedCourse = (course_id) => (dispatch) =>
  dispatch({ type: D_SET_SELECTED_COURSE, data: course_id });

export const cleanErrors = () => (dispatch) => {
  dispatch({ type: CLEAN_ERRORS });
};

/**
 * Manage error with a retry function
 * @param {*} error
 * @param {Function} action
 * @param {String} action_type
 * @param {Function} dispatch
 * @param {Function} getState
 * @param {Number} retry
 * @returns dipatch for redux-thunk
 */
export const manageError = (
  error,
  action,
  action_type,
  dispatch,
  getState,
  retry
) => (...args) => {
  // Check that this was an HTTP error captured by axios
  if (
    error.customAttributes &&
    error.customAttributes.httpErrorStatus >= 500 &&
    retry > 0
  ) {
    return action(...args, retry - 1)(dispatch, getState);
  }

  // Recover either Error or Axios error data
  let msg = error.customAttributes
    ? error.customAttributes.httpErrorResponseData
    : error.toString();
  // Fix message if needed
  if (
    msg === undefined ||
    (error.customAttributes &&
      error.customAttributes.httpErrorStatus === 502) ||
    msg === '""'
  ) {
    msg = 'Hubo un error en el servidor';
  }
  dispatch({ type: action_type, data: [msg] });
};
