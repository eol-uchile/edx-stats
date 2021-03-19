import { DO_LOGIN, REFRESH_LOGIN, D_SET_SELECTED_COURSE } from '../types';
import { course } from './course';
import { times } from './times';
import { visits } from './visits';
import { createSelector } from 'reselect';

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
const getCourseRoleData = (state) => state.course.course_roles.data;
const getCourseEnrolledData = (state) => state.course.courses_enrolled.data;

/**
 * Merge course info and course roles to recover my courses
 */
const getMyCourses = createSelector(
  [getCourseRoleData, getCourseEnrolledData],
  (role_data, enrolled_data) => {
    let my_courses = {};
    role_data.forEach((course) => {
      my_courses[course.course_id] = course.roles;
    });
    let filtered_courses = enrolled_data.filter(
      (course) => course.key in my_courses
    );
    let merged_courses = filtered_courses.map((course) => ({
      ...course,
      roles: my_courses[course.key],
    }));
    let today = new Date();
    merged_courses.forEach((course) => {
      course['end'] = course['end'] === null ? today : course['end'];
    });
    return merged_courses;
  }
);

export { course, times, visits, dashboard, urls, auth, getMyCourses };
