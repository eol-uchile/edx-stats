import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { course as courseActions, actions } from '../../Courses/data/actions';
/**
 * Recover course structure
 * Add errors to error array
 * @param {Object} courseInfo
 * @param {Function} setLocalErrors
 * @returns
 */
function useLoadStructure(courseInfo, setLocalErrors) {
  const dispatch = useDispatch();
  useEffect(() => {
    if (
      courseInfo.current !== '' &&
      courseInfo.lowerDate !== '' &&
      courseInfo.upperDate !== ''
    ) {
      if (!courseInfo.allowed) {
        setLocalErrors([
          ...errors,
          'No tienes permisos para consultar estos datos',
        ]);
      } else {
        dispatch(courseActions.recoverCourseStructure(courseInfo.current));
        setLocalErrors([]);
        dispatch(actions.cleanErrors());
      }
    }
  }, [
    courseInfo.current,
    courseInfo.lowerDate,
    courseInfo.upperDate,
    courseInfo.allowed,
  ]);
  return;
}
/**
 * Recover course structure using a button
 * and reset boolean of object that stores it
 * Add errors to error array
 * @param {Object} courseInfo
 * @param {Function} setLocalErrors
 * @param {Object} courseStructure
 * @param {Function} setCourseStructure
 * @returns
 */
function useLoadStructureOnSubmit(
  courseInfo,
  setLocalErrors,
  courseStructure,
  setCourseStructure
) {
  const dispatch = useDispatch();
  // Load data when the button trigers
  const submit = () => {
    if (courseInfo.current !== '') {
      if (courseInfo.lowerDate === '' && courseInfo.upperDate === '') {
        setLocalErrors([...errors, 'Por favor ingrese fechas válidas']);
      } else if (!courseInfo.allowed) {
        setLocalErrors([
          ...errors,
          'No tienes permisos para consultar estos datos',
        ]);
      } else {
        setCourseStructure({ ...courseStructure, loaded: false });
        dispatch(courseActions.recoverCourseStructure(courseInfo.current));
        setLocalErrors([]);
        dispatch(actions.cleanErrors());
      }
    }
  };

  // Refresh course info and load
  useEffect(() => {
    courseInfo.courseName !== '' && submit();
  }, [courseInfo.courseName]);

  return submit;
}

export { useLoadStructure, useLoadStructureOnSubmit };
