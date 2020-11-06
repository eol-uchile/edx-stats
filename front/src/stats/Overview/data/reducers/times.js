import {
  LOADED_TIMES,
  LOADING_TIMES,
  LOADING_TIMES_ERROR,
  LOADED_TIMES_SUM,
  LOADED_TIMES_RESET,
  CLEAN_ERRORS,
} from '../types';

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

    case CLEAN_ERRORS:
      return {
        ...state,
        errors: [],
      };
    default:
      return state;
  }
}
