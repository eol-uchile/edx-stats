import {
  LOADING_VISITS,
  LOADED_VISITS,
  LOADED_VISITS_SUM,
  LOADED_VISITS_RESET,
  LOADING_VISITS_ERROR,
  CLEAN_ERRORS,
  LOADED_VISITS_CHAPTER_SUM,
} from '../types';

const initialVisitsState = {
  visits: [],
  added_visits: [],
  added_chapter_visits: [],
  errors: [],
  loading: false,
};
export function visits(state = initialVisitsState, action) {
  switch (action.type) {
    case LOADING_VISITS:
      return { ...state, loading: true };
    case LOADED_VISITS:
      return { ...state, visits: action.data, errors: [], loading: false };
    case LOADED_VISITS_SUM:
      return {
        ...state,
        added_visits: action.data,
        errors: [],
      };
    case LOADING_VISITS_ERROR:
      // Reset when changing between courses
      return {
        ...state,
        added_visits: [],
        visits: [],
        added_chapter_visits: [],
        errors: action.data,
        loading: false,
      };
    case LOADED_VISITS_RESET:
      return { ...initialVisitsState };
    case LOADED_VISITS_CHAPTER_SUM:
      return { ...state, added_chapter_visits: action.data };
    case CLEAN_ERRORS:
      return {
        ...state,
        errors: [],
      };
    default:
      return state;
  }
}
