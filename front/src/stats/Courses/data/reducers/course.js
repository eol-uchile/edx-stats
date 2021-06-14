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
  course: [], // course currently viewed
  course_status: 'idle',
  errors: [], // list of errors if any
  status: 'idle', // oneOf idle|loading|failed|success
  course_info: { data: [], count: 0 },
  courses_enrolled: [],
};

export function course(state = initialCourseState, action) {
  switch (action.type) {
    case LOADING_COURSE:
      // Set loading on inner prop
      return {
        ...state,
        [action.data]: 'loading',
      };
    case LOADED_COURSE:
      return {
        ...state,
        course: [...action.data],
        errors: [],
        course_status: 'success',
      };
    case LOADING_COURSE_ERROR:
      return {
        ...state,
        course: [],
        errors: [...action.data],
        course_status: 'failed',
      };
    case LOADED_COURSE_RESET:
      return { ...initialCourseState };
    case LOADED_COURSE_ROLES:
      return {
        ...state,
        status: 'loading',
        courses_enrolled: action.data,
      };
    case LOADED_COURSE_ROLES_ERROR:
      return {
        ...state,
        status: 'failed',
        courses_enrolled: [],
        errors: [...action.data],
      };
    case LOADED_COURSES_INFO:
      return {
        ...state,
        status: 'success',
        course_info: {
          data: [...action.data],
          count: action.data.length,
        },
      };
    case LOADED_COURSES_INFO_ERROR:
      return {
        ...state,
        status: 'failed',
        course_info: { data: [], count: 0 },
        errors: [...action.data],
      };
    case RESET_COURSE_STRUCTURE:
      return {
        ...state,
        course: [],
        course_status: 'idle',
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
