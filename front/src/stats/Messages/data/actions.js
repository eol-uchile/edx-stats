import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const LOADED_MESSAGES = 'LOADED_MESSAGES';
export const MESSAGE_ERRORS = 'MESSAGE_ERRORS';
export const DISMISS_MESSAGE = 'DISMISS_MESSAGE';

export const getMessages = (today) => (dispatch, getState) => {
  getAuthenticatedHttpClient()
    .get(
      `/api/webadmin/announcement/?published=true&created_at__gt=${today.toISOString()}`
    )
    .then((res) => {
      if (res.status === 200) {
        return dispatch({ type: LOADED_MESSAGES, data: res.data.results });
      }
      // What
      dispatch({ type: MESSAGE_ERRORS, data: [] });
    })
    .catch((error) => dispatch({ type: MESSAGE_ERRORS, data: [] }));
};

export const dismissMessage = (id) => (dispatch, getState) =>
  dispatch({ type: DISMISS_MESSAGE, data: id });
