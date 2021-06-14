import { REFRESH_LOGIN, REFRESH_ERROR } from './reducers';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const refreshTokens = () => (dispatch, getState) => {
  let lms = getState().urls.lms;
  getAuthenticatedHttpClient()
    .post(`${lms}/login_refresh`)
    .then((res) => {
      if (res.status === 200) {
        return dispatch({ type: REFRESH_LOGIN });
      }
      return dispatch({ type: REFRESH_ERROR, data: ['what'] });
    })
    .catch((error) => dispatch({ type: REFRESH_ERROR, data: [] }));
};
