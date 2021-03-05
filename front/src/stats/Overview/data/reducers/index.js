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

/* SELECTORS */

/**
 * Merge course info and course roles to recover my courses
 */
const selectMyCourses = (state) => {
  let my_courses = {};
  state.course.course_roles.data.forEach((course) => {
    my_courses[course.course_id] = course.roles;
  });
  let filtered_courses = state.course.courses_enrolled.data.filter(
    (course) => course.key in my_courses
  );
  return filtered_courses.map((course) => ({
    ...course,
    roles: my_courses[course.key],
  }));
};

export { course, times, visits, dashboard, urls, auth, selectMyCourses };
