import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const useProcessViewSum = (tableData, views, recoverData, errors) => {
  const course = useSelector((state) => state.course);

  const [rowData, setRowData] = useState({
    values: [],
    loaded: false,
  });

  useEffect(() => {
    if (course.course.length > 0) {
      let current = course.course[0];
      // Load data
      recoverData(current.id);
    }
    // eslint-disable-next-line
  }, [course.course]);

  useEffect(() => {
    if (tableData.loaded && views.length > 0 && errors.length === 0) {
      let bar = views.map((v) => ({
        position: tableData.videos[v.block_id].position
          ? tableData.videos[v.block_id].position
          : '',
        tooltip: tableData.videos[v.block_id].name
          ? tableData.videos[v.block_id].name
          : '',
        Minutos: Math.floor(v.watch_time / 60),
        Usuarios: v.viewers,
      }));
      setRowData({
        values: bar,
        loaded: true,
      });
    }
  }, [tableData.loaded, views]);

  useEffect(() => {
    if (errors.length > 0) {
      // If errors then reset the state
      setRowData({
        values: [],
        loaded: true,
      });
    }
  }, [errors]);

  return [rowData, setRowData];
};

export default useProcessViewSum;
