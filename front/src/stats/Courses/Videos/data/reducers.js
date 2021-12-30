import { CLEAN_ERRORS } from '../../data/types';

export const LOADED_VIDEOS_RESET = 'LOADED_VIDEOS_RESET';
export const LOADED_VIDEOS = 'LOADED_VIDEOS';
export const LOADED_VIEWS_SUM = 'LOADED_VIEWS_SUM';
export const LOADED_COVERAGE = 'LOADED_COVERAGE';
export const LOADED_VIDEO_DETAILS = 'LOADED_VIDEO_DETAILS';
export const LOADING_VIEWS_ERROR = 'LOADING_VIEWS_ERROR';

const initialVisitsState = {
  video_list: [],
  views: [],
  coverage: [],
  detailed: [],
  errors: [],
  loading: false,
};

export function videos(state = initialVisitsState, action) {
  switch (action.type) {
    case LOADED_VIDEOS:
      return {
        ...state,
        video_list: [...action.data],
        errors: [],
      };
    case LOADED_VIEWS_SUM:
      return {
        ...state,
        views: [...action.data],
      };
    case LOADED_COVERAGE:
      return {
        ...state,
        coverage: [...action.data],
      };
    case LOADED_VIDEO_DETAILS:
      return {
        ...state,
        detailed: [...action.data],
      };
    case LOADING_VIEWS_ERROR:
      return {
        ...state,
        video_list: [],
        views: [],
        coverage: [],
        detailed: [],
        errors: [...action.data],
        loading: false,
      };
    case LOADED_VIDEOS_RESET:
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
