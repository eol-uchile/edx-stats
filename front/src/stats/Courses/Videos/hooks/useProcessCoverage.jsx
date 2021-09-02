import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const useProcessCoverage = (data, recoverData, errors, setErrors, barData) => {
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
    if (barData.loaded && dataLoaded && data.coverage !== '') {
      let videos = data.coverage.reduce((acc, obj) => {
        const key = obj['block_id'];
        if (!acc[key]) {
          acc[key] = {
            block_id: obj['block_id'],
            name: barData.videos[obj['block_id']].name
              ? barData.videos[obj['block_id']].name
              : '',
            position: barData.videos[obj['block_id']].position
              ? barData.videos[obj['block_id']].position
              : '',
            Completo: 0,
            Incompleto: 0,
          };
        }
        // Add object to list for given key's value
        obj['coverage']>=0.9 ? (acc[key].Completo += 1) : (acc[key].Incompleto += 1);
        return acc;
      }, {});
      let stackedBars = Object.values(videos);
      setRowData({
        loaded: true,
        values: stackedBars,
      });
      setErrors([]);
    }
  }, [barData, dataLoaded, data.coverage]);

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

export default useProcessCoverage;
