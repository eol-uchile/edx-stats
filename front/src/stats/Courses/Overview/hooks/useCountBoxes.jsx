import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const useCountBoxes = (
  data,
  recoverData,
  errors,
  setErrors,
  upperDate,
  lowerDate
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

  const [countBox, setCountBox] = useState({
    visits: { loaded: false, value: 0 },
    users: { loaded: false, value: 0 },
    times: { loaded: false, value: 0 },
  });

  useEffect(() => {
    if (dataLoaded && data.general_visits !== '') {
      setCountBox({
        ...countBox,
        visits: {
          loaded: true,
          value: data.general_visits,
        },
      });
    }
  }, [dataLoaded, data.general_visits]);

  useEffect(() => {
    if (dataLoaded && data.general_users !== '') {
      setCountBox({
        ...countBox,
        users: {
          loaded: true,
          value: data.general_users,
        },
      });
    }
  }, [dataLoaded, data.general_users]);

  useEffect(() => {
    if (dataLoaded && data.general_times !== '') {
      let seconds = data.general_times;
      let minutes = Math.floor(seconds / 60);
      setCountBox({
        ...countBox,
        times: {
          loaded: true,
          value: minutes,
        },
      });
    }
  }, [dataLoaded, data.general_times]);

  return [dataLoaded, setDataLoaded, countBox];
};

export default useCountBoxes;
