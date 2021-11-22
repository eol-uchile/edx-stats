import {
    LOADING_STUDENT,
    LOADED_STUDENT,
    LOADING_STUDENT_ERROR,
    LOADED_STUDENT_RESET,
    CLEAN_ERRORS,
  } from '../types';
  
  const initialCourseState = {
    student_details: {},
    errors: [], // list of errors if any
    status: 'idle', // oneOf idle|loading|failed|success
  };
  
  export function student(state = initialCourseState, action) {
    switch (action.type) {
      case LOADING_STUDENT:
        return {
          ...state,
          status: 'loading',
        };
      case LOADED_STUDENT:
        return {
          ...state,
          student_details: action.data,
          errors: [],
          status: 'success',
        };
      case LOADING_STUDENT_ERROR:
        return {
          ...state,
          student_details: {},
          errors: [...action.data],
          status: 'failed',
        };
      case LOADED_STUDENT_RESET:
        return { ...initialCourseState };
      case CLEAN_ERRORS:
        return {
          ...state,
          errors: [],
        };
      default:
        return state;
    }
  }
  