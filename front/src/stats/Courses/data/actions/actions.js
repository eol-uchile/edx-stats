import { CLEAN_ERRORS } from '../types';

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
export const manageError =
  (error, action, action_type, dispatch, getState, retry) =>
  (...args) => {
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
