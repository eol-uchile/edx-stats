import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
/**
 * Manage data recovery
 * @param {Object} courseVideos
 * @param {Array} views
 * @param {Function} recoverData
 * @param {Array} errors
 * @returns
 */
const useProcessViewSum = (courseVideos, views, recoverData, errors) => {
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
    if (courseVideos.loaded && views.length > 0 && errors.length === 0) {
      let bar = views.map((v) => ({
        val: courseVideos.videos[v.block_id].val
          ? courseVideos.videos[v.block_id].val
          : '',
        tooltip: courseVideos.videos[v.block_id].tooltip
          ? courseVideos.videos[v.block_id].tooltip
          : '',
        Minutos: Math.floor(v.watch_time / 60),
        Usuarios: v.viewers,
      }));
      setRowData({
        values: bar,
        loaded: true,
      });
    }
  }, [courseVideos.loaded, views]);

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
