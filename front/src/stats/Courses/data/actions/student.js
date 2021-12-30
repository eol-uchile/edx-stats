import {
    DO_LOGIN,
    LOADED_STUDENT_RESET,
    LOADING_STUDENT,
    LOADED_STUDENT,
    LOADING_STUDENT_ERROR,
} from '../types';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { manageError } from './actions';

export const resetStudents = () => (dispatch) =>
    dispatch({ type: LOADED_STUDENT_RESET });

export const recoverStudentInfo =
    (course_id = 'nan', username = 'nan', retry = 1) =>
        (dispatch, getState) => {
            let base = getState().urls.base;

            dispatch({ type: LOADING_STUDENT });

            return getAuthenticatedHttpClient()
                .get(
                    `${base}/api/core/student-info/?course=${encodeURIComponent(
                        course_id
                    )}&username=${encodeURIComponent(
                        username
                    )}`
                )
                .then((res) => {
                    if (res.request.responseURL.includes('login/?next=')) {
                        return dispatch({ type: DO_LOGIN });
                    }
                    if (res.status === 200) {
                        return dispatch({ type: LOADED_STUDENT, data: res.data.student[0] });
                    }
                    throw Error(
                        'El estudiante no ha sido ingresado al sistema, por favor intente más tarde.'
                    );
                })
                .catch((error) =>
                    manageError(
                        error,
                        recoverStudentInfo,
                        LOADING_STUDENT_ERROR,
                        dispatch,
                        getState
                    )(username)
                );
        };