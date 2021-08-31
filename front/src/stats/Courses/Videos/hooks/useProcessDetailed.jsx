import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const parseSecondToTimeString = (s) => {
  let ss = String(Math.floor(s % 60)).padStart(2, '0');
  let mm = String(Math.floor(s / 60)).padStart(2, '0');
  return `${mm}:${ss}`;
};
const useProcessDetailed = (data, recoverData, errors, setErrors, video) => {
  const course = useSelector((state) => state.course);

  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (course.course.length > 0 && video.block_id != '') {
      let current = course.course[0];
      setDataLoaded(true);
      // Load data
      recoverData(current.id, video.block_id);
    }
    // eslint-disable-next-line
  }, [course.course, video]);

  const [rowData, setRowData] = useState({
    loaded: false,
    values: [],
  });

  useEffect(() => {
    if (dataLoaded && data.detailed != '') {
      let partitionsPerUser = data.detailed;
      let videoPartitions = {};
      partitionsPerUser.forEach((st_p) => {
        Object.keys(st_p).forEach((second) => {
          if (videoPartitions[second]) {
            videoPartitions[second].unique += 1;
            videoPartitions[second].repetition += st_p[second] - 1;
          } else {
            videoPartitions[second] = {
              unique: 1,
              repetition: st_p[second] - 1,
            };
          }
        });
      });
      let points = [];
      for (var i = 0; i <= video.duration; i++) {
        points.push({
          second: parseSecondToTimeString(i),
          Visualizaciones: videoPartitions[i] ? videoPartitions[i].unique : 0,
          Repeticiones: videoPartitions[i] ? videoPartitions[i].repetition : 0,
        });
      }
      setRowData({
        loaded: true,
        values: points,
      });
      setErrors([]);
    }
  }, [dataLoaded, data.detailed]);

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

export default useProcessDetailed;
