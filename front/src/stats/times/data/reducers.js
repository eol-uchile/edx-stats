import {
  LOADED_COURSE,
  LOADED_TIMES,
  LOADING_COURSE,
  LOADING_COURSE_ERROR,
  LOADING_TIMES,
  LOADING_TIMES_ERROR,
} from './types';

const initialTimeState = {
  times: [],
  errors: [],
  loading: false,
};
export function times(state = initialTimeState, action) {
  switch (action.type) {
    case LOADING_TIMES:
      return { ...state, loading: true };
    case LOADED_TIMES:
      return { times: [...action.data.results], errors: [], loading: false };
    case LOADING_TIMES_ERROR:
      return { times: [], errors: [...action.data], loading: false };
    default:
      return state;
  }
}

const initialCourseState = {
  course: [],
  errors: [],
  loading: false,
};
export function course(state = initialCourseState, action) {
  switch (action.type) {
    case LOADING_COURSE:
      return { ...state, loading: true };
    case LOADED_COURSE:
      return { course: [...action.data.results], errors: [], loading: false };
    case LOADING_COURSE_ERROR:
      return { course: [], errors: [...action.data], loading: false };
    default:
      return state;
  }
}
