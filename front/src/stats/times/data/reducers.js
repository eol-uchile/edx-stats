import {
  LOADED_COURSE,
  LOADED_TIMES,
  LOADING_COURSE,
  LOADING_COURSE_ERROR,
  LOADING_TIMES,
  LOADING_TIMES_ERROR,
  LOADED_TIMES_SUM,
  DO_LOGIN,
  LOADED_TIMES_RESET,
  LOADED_COURSE_RESET,
  LOADED_COURSE_ROLES,
  LOADED_COURSE_ROLES_ERROR,
  REFRESH_LOGIN,
} from './types';

const initialTimeState = {
  times: [],
  added_times: [],
  errors: [],
  loading: false,
};
export function times(state = initialTimeState, action) {
  switch (action.type) {
    case LOADING_TIMES:
      return { ...state, loading: true };
    case LOADED_TIMES:
      return { ...state, times: [...action.data], errors: [], loading: false };
    case LOADED_TIMES_SUM:
      return {
        ...state,
        added_times: [...action.data],
        errors: [],
        loading: false,
      };
    case LOADING_TIMES_ERROR:
      return { ...state, times: [], errors: [...action.data], loading: false };
    case LOADED_TIMES_RESET:
      return { ...initialTimeState };
    default:
      return state;
  }
}

const initialCourseState = {
  course: [],
  verticals: [],
  errors: [],
  loading: false,
  availableCourses: [],
};
export function course(state = initialCourseState, action) {
  switch (action.type) {
    case LOADING_COURSE:
      return { ...state, loading: true };
    case LOADED_COURSE:
      return { ...state, course: [...action.data], errors: [], loading: false };
    case LOADING_COURSE_ERROR:
      return { ...state, course: [], errors: [...action.data], loading: false };
    case LOADED_COURSE_RESET:
      return { ...initialCourseState };
    case LOADED_COURSE_ROLES:
      return { ...state, availableCourses: [...action.data], loading: false };
    case LOADED_COURSE_ROLES_ERROR:
      return {
        ...state,
        availableCourses: [],
        errors: [...action.data],
        loading: false,
      };
    default:
      return state;
  }
}

const initialAuthState = {
  doLogin: false,
};

export function auth(state = initialAuthState, action) {
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
export function urls(state = { lms: '', base: '' }, action) {
  return state;
}
