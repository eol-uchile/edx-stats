import {
  LOADING_VISITS,
  LOADED_VISITS,
  LOADED_VISITS_SUM,
  LOADED_VISITS_RESET,
  LOADING_VISITS_ERROR,
  CLEAN_ERRORS,
} from '../types';

const initialVisitsState = {
  visits: [],
  added_visits: [],
  errors: [],
  loading: false,
};
export function visits(state = initialVisitsState, action) {
  switch (action.type) {
    case LOADING_VISITS:
      return { ...state, loading: true };
    case LOADED_VISITS:
      return { ...state, visits: [...action.data], errors: [], loading: false };
    case LOADED_VISITS_SUM:
      return {
        ...state,
        added_visits: [...action.data],
        errors: [],
      };
    case LOADING_VISITS_ERROR:
      return {
        ...state,
        added_visits: [],
        visits: [],
        errors: [...action.data],
        loading: false,
      };
    case LOADED_VISITS_RESET:
      return { ...initialVisitsState };

    case CLEAN_ERRORS:
      return {
        ...state,
        errors: [],
      };
    default:
      return state;
  }
}
