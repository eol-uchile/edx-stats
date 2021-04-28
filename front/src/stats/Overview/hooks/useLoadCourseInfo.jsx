import React, { useEffect, useState } from 'react';

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
 * @param {Function} initCourses
 * @param {Function} resetData
 * @param {Function} resetCourse
 * @param {Function} cleanErrors
 * @param {String} courseStatus
 * @param {Array} courseErrors
 * @param {Array} dataErrors
 * @param {Array} myCourses
 * @param {Boolean} hasCourses
 * @param {Function} setSelectedCourse
 * @returns
 */
function useLoadCourseInfo(
  match,
  initCourses,
  resetData,
  resetCourse,
  cleanErrors,
  courseStatus,
  courseErrors,
  dataErrors,
  myCourses,
  hasCourses,
  setSelectedCourse
) {
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
    if (myCourses.length === 0) {
      initCourses();
    }
    setSelectedCourse(match.params.course_id);
    return () => {
      resetData();
      resetCourse();
      cleanErrors();
    };
  }, []);

  // Update courseName when data arrives
  useEffect(() => {
    if (courseStatus === 'success' || courseStatus === 'failed') {
      if (hasCourses) {
        let thisCourse = myCourses.filter(
          (el) => el.key === match.params.course_id
        )[0];
        if (thisCourse) {
          setState({ ...state, courseName: thisCourse.title });
        } else {
          setState({ ...state, allowed: false });
        }
      } else {
        setState({ ...state, allowed: false });
      }
    }
  }, [hasCourses, myCourses, courseStatus]);

  // Copy errors to local state
  useEffect(() => {
    if (courseErrors.length > 0 || dataErrors.length > 0) {
      setErrors([...courseErrors, ...dataErrors]);
    }
  }, [courseErrors, dataErrors]);

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
  };

  return [state, setState, errors, setErrors, removeErrors];
}

export default useLoadCourseInfo;
