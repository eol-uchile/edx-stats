import { CLEAN_ERRORS } from '../../data/types';

export const LOADING_TIMES = 'LOADING_TIMES';
export const LOADED_TIMES = 'LOADED_TIMES';
export const LOADING_TIMES_ERROR = 'LOADING_TIMES_ERROR';
export const LOADED_TIMES_RESET = 'LOADED_TIMES_RESET';
export const LOADED_TIMES_SUM = 'LOADED_TIMES_SUM';

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
