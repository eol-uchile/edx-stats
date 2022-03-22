import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
/**
 * Manage data recovery
 * @param {Object} courseVideos
 * @param {Array} coverage
 * @param {Function} recoverData
 * @param {Array} errors
 * @returns
 */
const useProcessCoverage = (courseVideos, coverage, recoverData, errors) => {
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
    if (courseVideos.loaded && coverage.length > 0 && errors.length === 0) {
      let videos = coverage.reduce((acc, obj) => {
        const key = obj['block_id'];
        if (!acc[key]) {
          acc[key] = {
            block_id: obj['block_id'],
            tooltip: courseVideos.videos[obj['block_id']].tooltip
              ? courseVideos.videos[obj['block_id']].tooltip
              : '',
            val: courseVideos.videos[obj['block_id']].val
              ? courseVideos.videos[obj['block_id']].val
              : '',
            Completo: obj['completed'],
            Incompleto: obj['uncompleted'],
          };
        }
        return acc;
      }, {});
      let stackedBars = Object.values(videos);
      setRowData({
        values: stackedBars,
        loaded: true,
      });
    }
  }, [courseVideos, coverage]);

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

export default useProcessCoverage;
