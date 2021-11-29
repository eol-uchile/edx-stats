import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { course as courseActions, actions } from '../../Courses/data/actions';

function useLoadStructure(courseInfo, setLocalErrors) {
  const dispatch = useDispatch();
  useEffect(() => {
    if (
      courseInfo.current !== '' &&
      courseInfo.lowerDate !== '' &&
      courseInfo.upperDate !== '' &&
      courseInfo.allowed
    ) {
      dispatch(courseActions.recoverCourseStructure(courseInfo.current));
      setLocalErrors([]);
      dispatch(actions.cleanErrors());
    }
  }, [
    courseInfo.current,
    courseInfo.lowerDate,
    courseInfo.upperDate,
    courseInfo.allowed,
  ]);
  return;
}

function useLoadStructureOnSubmit(courseInfo, setLocalErrors, tableData, setTableData) {
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
        setTableData({ ...tableData, loaded: false });
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
