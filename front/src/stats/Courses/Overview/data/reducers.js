import { CLEAN_ERRORS } from '../../data/types';

export const LOADING_DETAILED_STATS = 'LOADING_DETAILED_STATS';
export const LOADED_GENERAL_STATS_RESET = 'LOADED_GENERAL_STATS_RESET';

export const LOADED_GENERAL_TIMES = 'LOADED_GENERAL_TIMES';
export const LOADING_GENERAL_TIMES_ERROR = 'LOADING_GENERAL_TIMES_ERROR';

export const LOADED_DETAILED_TIMES = 'LOADED_DETAILED_TIMES';
export const LOADING_DETAILED_TIMES_ERROR = 'LOADING_DETAILED_TIMES_ERROR';

export const LOADED_GENERAL_VISITS = 'LOADED_GENERAL_VISITS';
export const LOADING_GENERAL_VISITS_ERROR = 'LOADING_GENERAL_VISITS_ERROR';

export const LOADED_DETAILED_VISITS = 'LOADED_DETAILED_VISITS';
export const LOADING_DETAILED_VISITS_ERROR = 'LOADING_DETAILED_VISITS_ERROR';

export const LOADED_GENERAL_USERS = 'LOADED_GENERAL_USERS';
export const LOADING_GENERAL_USERS_ERROR = 'LOADING_GENERAL_USERS_ERROR';

const initialGeneralState = {
    general_times: '',
    general_visits: '',
    general_users: '',
    general_errors: [],
    detailed_times: '',
    detailed_visits: {
        date: '',
        module: '',
        seq: '',
    },
    detailed_errors: [],
    loading: false,
};

export function generalStats(state = initialGeneralState, action) {
    switch (action.type) {
        case LOADING_DETAILED_STATS:
            return { ...state, loading: true };
        case LOADED_GENERAL_TIMES:
            return {
                ...state,
                general_times: action.data.total_time,
            };
        case LOADING_GENERAL_TIMES_ERROR:
            return {
                ...state,
                general_times: 0,
                general_errors: [...action.data],
            };
        case LOADED_DETAILED_TIMES:
            return {
                ...state,
                detailed_times: action.data.total_time,
                loading: false,
            };
        case LOADING_DETAILED_TIMES_ERROR:
            return {
                ...state,
                detailed_times: '',
                detailed_errors: [...action.data],
                loading: false,
            };
        case LOADED_GENERAL_VISITS:
            return {
                ...state,
                general_visits: action.data.total_visits,
            };
        case LOADING_GENERAL_VISITS_ERROR:
            return {
                ...state,
                general_visits: 0,
                general_errors: [...action.data],
            };
        case LOADED_DETAILED_VISITS:
            return {
                ...state,
                detailed_visits: action.data.total_visits,
                loading: false,
            };
        case LOADING_DETAILED_VISITS_ERROR:
            return {
                ...state,
                detailed_visits: { date: '', module: '', seq: '' },
                detailed_errors: [...action.data],
                loading: false,
            };
        case LOADED_GENERAL_USERS:
            return {
                ...state,
                general_users: action.data.total_users,
            };
        case LOADING_GENERAL_USERS_ERROR:
            return {
                ...state,
                general_users: 0,
                general_errors: [...action.data],
            };
        case LOADED_GENERAL_STATS_RESET:
            return { ...initialGeneralState };

        case CLEAN_ERRORS:
            return {
                ...state,
                general_errors: [],
                detailed_errors: []
            };
        default:
            return state;
    }
}
