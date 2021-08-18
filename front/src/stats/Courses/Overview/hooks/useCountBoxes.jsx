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
    loaded: false,
    values: { visits: 0, users: 0, times: 0 },
  });

  useEffect(() => {
    if (
      dataLoaded &&
      data.general_visits !== '' &&
      data.general_users !== '' &&
      data.general_times !== ''
    ) {
      let seconds = data.general_times;
      let minutes = Math.floor(seconds / 60);
      setCountBox({
        loaded: true,
        values: {
          visits: data.general_visits,
          users: data.general_users,
          times: minutes,
        },
      });
      setErrors([]);
    }
  }, [dataLoaded, data.general_visits, data.general_users, data.general_times]);

  useEffect(() => {
    if (errors.length > 0) {
      // If errors then reset the state
      setCountBox({
        loaded: false,
        values: { visits: 0, users: 0, times: 0 },
      });
    }
  }, [errors]);

  return [dataLoaded, setDataLoaded, countBox];
};

export default useCountBoxes;
