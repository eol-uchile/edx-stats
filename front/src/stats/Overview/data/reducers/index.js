import { DO_LOGIN, REFRESH_LOGIN, D_SET_SELECTED_COURSE } from '../types';
import { course } from './course';
import { times } from './times';
import { visits } from './visits';

const initialAuthState = {
  doLogin: false,
};

function auth(state = initialAuthState, action) {
  switch (action.type) {
    case DO_LOGIN:
      return { ...state, doLogin: true };
    case REFRESH_LOGIN:
      return state;
    default:
      return state;
  }
}

/**
 * Dummy Url holder on Redux
 * @param {*} state
 * @param {*} action
 */
function urls(state = { lms: '', base: '' }, action) {
  return state;
}

/**
 * Load Dashboard navigation information
 * @param {*} state
 */
function dashboard(state = { selected: '' }, action) {
  switch (action.type) {
    case D_SET_SELECTED_COURSE:
      return { selected: action.data };
    default:
      return state;
  }
}

export { course, times, visits, dashboard, urls, auth };
