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
