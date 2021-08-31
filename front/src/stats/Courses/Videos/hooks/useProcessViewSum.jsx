import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const useProcessViewSum = (data, recoverData, errors, setErrors, barData) => {
  const course = useSelector((state) => state.course);

  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (course.course.length > 0) {
      let current = course.course[0];
      setDataLoaded(true);
      // Load data
      recoverData(current.id);
    }
    // eslint-disable-next-line
  }, [course.course]);

  const [rowData, setRowData] = useState({
    loaded: false,
    values: [],
  });

  useEffect(() => {
    if (barData.loaded && dataLoaded && data.views != '') {
      let bar = data.views.map((v) => ({
        position: barData.videos[v.block_id].position
          ? barData.videos[v.block_id].position
          : '',
        name: barData.videos[v.block_id].name
          ? barData.videos[v.block_id].name
          : '',
        Minutos: Math.floor(v.watch_time / 60),
        Usuarios: v.viewers,
      }));
      setRowData({
        loaded: true,
        values: bar,
      });
      setErrors([]);
    }
  }, [barData, dataLoaded, data.views]);

  useEffect(() => {
    if (errors.length > 0) {
      // If errors then reset the state
      setRowData({
        loaded: true,
        values: [],
      });
    }
  }, [errors]);

  return [dataLoaded, setDataLoaded, rowData];
};

export default useProcessViewSum;
