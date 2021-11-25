import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getHasCourses, getMyCourses } from '../data/selectors';
import { course as courseActions, actions } from '../data/actions';
/**
 * Manage data recovery with form params
 * accounting for user permissions
 *
 * Recover courses if not loaded
 * Recover course structure
 * Clean Data on unmount
 * Manage Error grouping
 *
 * @param {Object} match
 * @param {Function} resetData
 * @param {Array} dataErrors
 * @returns
 */
function useLoadCourseInfo(match, resetData, dataErrors) {
  const course = useSelector((state) => state.course);
  const hasCourses = useSelector((state) => getHasCourses(state));
  const myCourses = useSelector((state) => getMyCourses(state));
  const dispatch = useDispatch();

  const [state, setState] = useState({
    current: match.params.course_id ? match.params.course_id : '',
    lowerDate: match.params.start ? match.params.start : '',
    upperDate: match.params.end ? match.params.end : '',
    courseName: '',
    allowed: true,
  });

  const [errors, setErrors] = useState([]);

  // Load course info only when necessary
  // Add clean up functions
  useEffect(() => {
    return () => {
      resetData();
      dispatch(courseActions.resetCourseStructure());
      dispatch(actions.cleanErrors());
    };
  }, []);

  // Update courseName when data arrives
  useEffect(() => {
    if (course.status === 'success' || course.status === 'failed') {
      if (hasCourses) {
        let thisCourse = myCourses.filter(
          (el) => el.key === match.params.course_id
        )[0];
        if (thisCourse) {
          if (state.lowerDate !== '' && state.upperDate !== '') {
            // for TimesTable and VisitsTable
            setState({ ...state, courseName: thisCourse.title });
          } else {
            // for Overview and VideosTable
            setState({
              ...state,
              courseName: thisCourse.title,
              lowerDate: thisCourse.start,
              upperDate: thisCourse.end,
            });
          }
        } else {
          setState({ ...state, allowed: false });
        }
      } else {
        setState({ ...state, allowed: false });
      }
    }
  }, [hasCourses, myCourses, course.status]);

  // Copy errors to local state
  useEffect(() => {
    if (course.errors.length > 0 || dataErrors.length > 0) {
      setErrors([...course.errors, ...dataErrors]);
    }
  }, [course.errors, dataErrors]);

  // If not allowed display error
  useEffect(() => {
    !state.allowed &&
      setErrors([
        ...errors,
        'No tienes permiso para ver los datos de este curso.',
      ]);
  }, [state.allowed]);

  const removeErrors = (msg) => {
    let newErrors = errors.filter((el) => msg !== el);
    setErrors(newErrors);
    if (newErrors.length === 0) {
      dispatch(actions.cleanErrors());
    }
  };

  return [state, setState, errors, setErrors, removeErrors];
}

export default useLoadCourseInfo;
