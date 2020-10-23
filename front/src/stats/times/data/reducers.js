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
  LOADED_COURSES_INFO,
  LOADED_COURSES_INFO_ERROR,
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
      };
    case LOADING_TIMES_ERROR:
      return {
        ...state,
        added_times: [],
        times: [],
        errors: [...action.data],
        loading: false,
      };
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
  course_roles: { data: [], loading: false },
  courses_enrolled: { data: [], loading: false },
};
export function course(state = initialCourseState, action) {
  switch (action.type) {
    case LOADING_COURSE:
      // Set loading on inner prop
      if (action.data) {
        return {
          ...state,
          [action.data]: { ...state[action.data], loading: true },
        };
      }
      return { ...state, loading: true };
    case LOADED_COURSE:
      return { ...state, course: [...action.data], errors: [], loading: false };
    case LOADING_COURSE_ERROR:
      return { ...state, course: [], errors: [...action.data], loading: false };
    case LOADED_COURSE_RESET:
      return { ...initialCourseState };
    case LOADED_COURSE_ROLES:
      // Merge course roles on redudant data
      let courses = {};
      action.data.forEach((element) => {
        if (element.course_id in courses) {
          courses[element.course_id].push(element.role);
        } else {
          courses[element.course_id] = [element.role];
        }
      });
      let course_roles = Object.keys(courses).map((k) => ({
        course_id: k,
        roles: courses[k],
      }));
      return {
        ...state,
        course_roles: { data: course_roles, loading: false },
      };
    case LOADED_COURSE_ROLES_ERROR:
      return {
        ...state,
        course_roles: { data: [], loading: false },
        errors: [...action.data],
      };
    case LOADED_COURSES_INFO:
      return {
        ...state,
        courses_enrolled: { data: [...action.data], loading: false },
      };
    case LOADED_COURSES_INFO_ERROR:
      return {
        ...state,
        courses_enrolled: { data: [], loading: false },
        errors: [...action.data],
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

/* SELECTORS */

/**
 * Merge course info and course roles to recover my courses
 */
export const selectMyCourses = (state) => {
  let my_courses = {};
  state.course.course_roles.data.forEach((course) => {
    my_courses[course.course_id] = course.roles;
  });
  let filtered_courses = state.course.courses_enrolled.data.filter(
    (course) => course.id in my_courses
  );
  return filtered_courses.map((course) => ({
    ...course,
    roles: my_courses[course.id],
  }));
};
