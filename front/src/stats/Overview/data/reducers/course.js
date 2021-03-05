import {
  LOADED_COURSE,
  LOADING_COURSE,
  LOADING_COURSE_ERROR,
  LOADED_COURSE_RESET,
  LOADED_COURSE_ROLES,
  LOADED_COURSE_ROLES_ERROR,
  LOADED_COURSES_INFO,
  LOADED_COURSES_INFO_ERROR,
  RESET_COURSE_STRUCTURE,
  CLEAN_ERRORS,
} from '../types';

const initialCourseState = {
  course: [],
  verticals: [],
  errors: [],
  loading: false,
  course_roles: { data: [], count: 0, loading: false },
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
        courses_enrolled: {
          data: [...action.data.results],
          count: action.data.count,
          loading: false,
        },
      };
    case LOADED_COURSES_INFO_ERROR:
      return {
        ...state,
        courses_enrolled: { data: [], loading: false },
        errors: [...action.data],
      };
    case RESET_COURSE_STRUCTURE:
      return {
        ...state,
        course: [],
      };
    case CLEAN_ERRORS:
      return {
        ...state,
        errors: [],
      };
    default:
      return state;
  }
}
