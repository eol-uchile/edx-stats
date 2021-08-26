import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const useProcessViewSum = (
  data,
  recoverData,
  errors,
  setErrors,
  viewModules,
  lowerDate,
  upperDate
) => {
  const course = useSelector((state) => state.course);

  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (course.course.length !== 0 && lowerDate != '' && upperDate != '') {
      let current = course.course[0];
      setDataLoaded(true);
      // Load data
      recoverData(current.id, new Date(lowerDate), new Date(upperDate));
    }
    // eslint-disable-next-line
  }, [course.course, lowerDate, upperDate]);

  const [rowData, setRowData] = useState({
    loaded: false,
    values: [],
  });

  useEffect(() => {
    if (dataLoaded && data.views.length !== 0) {
      let bar = data.views.map((v) => ({
        position: v.position,
        name: v.name,
        Minutos: Math.floor(v.watch_time / 60),
        Usuarios: v.viewers,
      }));
      setRowData({
        loaded: true,
        values: bar,
      });
      setErrors([]);
    }
  }, [dataLoaded, data.views]);

  useEffect(() => {
    if (errors.length > 0) {
      // If errors then reset the state
      setRowData({
        loaded: false,
        values: [],
      });
    }
  }, [errors]);

  return [dataLoaded, setDataLoaded, rowData];
};

export default useProcessViewSum;
