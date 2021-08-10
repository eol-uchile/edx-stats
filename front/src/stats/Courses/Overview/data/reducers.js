import { CLEAN_ERRORS } from '../../data/types';

export const LOADING_GENERAL_STATS = 'LOADING_GENERAL_STATS';
export const LOADED_GENERAL_STATS_RESET = 'LOADED_GENERAL_STATS_RESET';

export const LOADED_GENERAL_TIMES = 'LOADED_GENERAL_TIMES';
export const LOADING_GENERAL_TIMES_ERROR = 'LOADING_GENERAL_TIMES_ERROR';

export const LOADED_DETAILED_TIMES = 'LOADED_DETAILED_TIMES';
export const LOADING_DETAILED_TIMES_ERROR = 'LOADING_DETAILED_TIMES_ERROR';

export const LOADED_GENERAL_VISITS = 'LOADED_GENERAL_VISITS';
export const LOADING_GENERAL_VISITS_ERROR = 'LOADING_GENERAL_VISITS_ERROR';

export const LOADED_DETAILED_VISITS = 'LOADED_DETAILED_VISITS';
export const LOADING_DETAILED_VISITS_ERROR = 'LOADING_DETAILED_VISITS_ERROR';

const initialGeneralState = {
    general_times: '',
    detailed_times: '',
    general_visits: '',
    detailed_visits: {
        date: '',
        module: '',
        seq: '',
    },
    general_users: '',
    errors: [],
    loading: false,
};

export function generalStats(state = initialGeneralState, action) {
    switch (action.type) {
        case LOADING_GENERAL_STATS:
            return { ...state, loading: true };
        case LOADED_GENERAL_TIMES:
            return {
                ...state,
                general_times: action.data.total_time,
                errors: [], //y los errores de visits?,
                loading: false, //y el loading de visits?
            };
        case LOADING_GENERAL_TIMES_ERROR:
            return {
                ...state,
                general_times: '',
                errors: [...action.data], //y los errores de visits?
                loading: false,  //y el loading de visits?
            };
        case LOADED_DETAILED_TIMES:
            return {
                ...state,
                detailed_times: action.data.total_time,
                errors: [], //y los errores de los otros?,
                loading: false, //y el loading de los otros?
            };
        case LOADING_DETAILED_TIMES_ERROR:
            return {
                ...state,
                detailed_times: '',
                errors: [...action.data], //y los errores de los otros?
                loading: false,  //y el loading de los otros?
            };
        case LOADED_GENERAL_VISITS:
            return {
                ...state,
                general_visits: action.data.total_visits,
                general_users: action.data.total_users,
                errors: [], //y los errores de times?
                loading: false, //y el loading de times?
            };
        case LOADING_GENERAL_VISITS_ERROR:
            return {
                ...state,
                general_visits: '',
                general_users: '',
                errors: [...action.data], //y los errores de times?
                loading: false, //y el loading de times?
            };
        case LOADED_DETAILED_VISITS:
            return {
                ...state,
                detailed_visits: action.data.total_visits,
                errors: [], //y los errores de los otros?,
                loading: false, //y el loading de los otros?
            };
        case LOADING_DETAILED_VISITS_ERROR:
            return {
                ...state,
                detailed_visits: { date: '', module: '', seq: '' },
                errors: [...action.data], //y los errores de los otros?
                loading: false,  //y el loading de los otros?
            };
        case LOADED_GENERAL_STATS_RESET:
            return { ...initialGeneralState };

        case CLEAN_ERRORS:
            return {
                ...state,
                errors: [],
            };
        default:
            return state;
    }
}
