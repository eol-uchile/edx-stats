import {
    LOADING_GENERAL_STATS,
    LOADED_GENERAL_STATS_RESET,
    LOADING_GENERAL_TIMES_ERROR,
    LOADED_GENERAL_TIMES,
    LOADING_DETAILED_TIMES_ERROR,
    LOADED_DETAILED_TIMES,
    LOADING_GENERAL_VISITS_ERROR,
    LOADED_GENERAL_VISITS,
    LOADING_DETAILED_VISITS_ERROR,
    LOADED_DETAILED_VISITS,
} from './reducers';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { actions } from '../../data/actions';
import { DO_LOGIN } from '../../data/types';

export const resetGeneralStats = () => (dispatch) =>
    dispatch({ type: LOADED_GENERAL_STATS_RESET });

export const setLoadingGeneralStats = () => (dispatch) =>
    dispatch({ type: LOADING_GENERAL_STATS });

export const recoverCourseGeneralTimes =
    (course_id = 'nan', lower_date, upper_date, retry = 1) =>
        (dispatch, getState) => {
            let base = getState().urls.base;

            return getAuthenticatedHttpClient()
                .get(
                    `${base}/api/times/timeoncourse/overview/?course=${encodeURIComponent(
                        course_id
                    )}&time__gte=${lower_date.toISOString()}&time__lte=${upper_date.toISOString()}`
                )
                .then((res) => {
                    if (res.request.responseURL.includes('login/?next=')) {
                        return dispatch({ type: DO_LOGIN });
                    }
                    if (res.status === 200) {
                        return dispatch({ type: LOADED_GENERAL_TIMES, data: res.data })
                    }
                    throw Error(
                        'No hay datos para el curso para estas fechas, por favor intente mas tarde.'
                    );
                })
                .catch((error) =>
                    actions.manageError(
                        error,
                        recoverCourseGeneralTimes,
                        LOADING_GENERAL_TIMES_ERROR,
                        dispatch,
                        getState
                    )(course_id, lower_date, upper_date)
                );
        };
export const recoverCourseGeneralVisits =
    (course_id = 'nan', lower_date, upper_date, retry = 1) =>
        (dispatch, getState) => {
            let base = getState().urls.base;

            return getAuthenticatedHttpClient()
                .get(
                    `${base}/api/visits/visitsoncourse/overview/?course=${encodeURIComponent(
                        course_id
                    )}&time__gte=${lower_date.toISOString()}&time__lte=${upper_date.toISOString()}`
                )
                .then((res) => {
                    if (res.request.responseURL.includes('login/?next=')) {
                        return dispatch({ type: DO_LOGIN });
                    }
                    if (res.status === 200) {
                        return dispatch({ type: LOADED_GENERAL_VISITS, data: res.data })
                    }
                    throw Error(
                        'No hay datos para el curso para estas fechas, por favor intente mas tarde.'
                    );
                })
                .catch((error) =>
                    actions.manageError(
                        error,
                        recoverCourseGeneralVisits,
                        LOADING_GENERAL_VISITS_ERROR,
                        dispatch,
                        getState
                    )(course_id, lower_date, upper_date)
                );
        };

export const recoverCourseDetailedTimes =
(course_id = 'nan', lower_date, upper_date, retry = 1) =>
    (dispatch, getState) => {
        let base = getState().urls.base;

        return getAuthenticatedHttpClient()
            .get(
                `${base}/api/times/timeoncourse/overview/detailed/?course=${encodeURIComponent(
                    course_id
                )}&time__gte=${lower_date.toISOString()}&time__lte=${upper_date.toISOString()}`
            )
            .then((res) => {
                if (res.request.responseURL.includes('login/?next=')) {
                    return dispatch({ type: DO_LOGIN });
                }
                if (res.status === 200) {
                    return dispatch({ type: LOADED_DETAILED_TIMES, data: res.data });
                }
                throw Error(
                    'No hay datos para el curso para estas fechas, por favor intente mas tarde.'
                );
            })
            .catch((error) =>
                actions.manageError(
                    error,
                    recoverCourseGeneralTimes,
                    LOADING_DETAILED_TIMES_ERROR,
                    dispatch,
                    getState
                )(course_id, lower_date, upper_date)
            );
    };
export const recoverCourseDetailedVisits =
    (course_id = 'nan', lower_date, upper_date, retry = 1) =>
        (dispatch, getState) => {
            let base = getState().urls.base;

            return getAuthenticatedHttpClient()
                .get(
                    `${base}/api/visits/visitsoncourse/overview/detailed/?course=${encodeURIComponent(
                        course_id
                    )}&time__gte=${lower_date.toISOString()}&time__lte=${upper_date.toISOString()}`
                )
                .then((res) => {
                    if (res.request.responseURL.includes('login/?next=')) {
                        return dispatch({ type: DO_LOGIN });
                    }
                    if (res.status === 200) {
                        return dispatch({ type: LOADED_DETAILED_VISITS, data: res.data })
                    }
                    throw Error(
                        'No hay datos para el curso para estas fechas, por favor intente mas tarde.'
                    );
                })
                .catch((error) =>
                    actions.manageError(
                        error,
                        recoverCourseGeneralVisits,
                        LOADING_DETAILED_VISITS_ERROR,
                        dispatch,
                        getState
                    )(course_id, lower_date, upper_date)
                );
        };
