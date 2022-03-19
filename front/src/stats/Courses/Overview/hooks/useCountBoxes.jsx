import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
/**
 * Manage data recovery
 * @param {Object} data
 * @param {Function} recoverData
 * @param {String} upperDate
 * @param {String} lowerDate
 * @returns
 */
const useCountBoxes = (data, recoverData, upperDate, lowerDate) => {
  const course = useSelector((state) => state.course);

  useEffect(() => {
    if (course.course.length !== 0 && lowerDate != '' && upperDate != '') {
      let current = course.course[0];
      // Load data
      recoverData(current.id, new Date(lowerDate), new Date(upperDate));
    }
    // eslint-disable-next-line
  }, [course.course, lowerDate, upperDate]);

  const [visitsBox, setVisitsBox] = useState({
    loaded: false,
    value: 0,
  });

  const [usersBox, setUsersBox] = useState({
    loaded: false,
    value: 0,
  });

  const [timesBox, setTimesBox] = useState({
    loaded: false,
    value: 0,
  });

  useEffect(() => {
    if (data.general_visits !== '') {
      setVisitsBox({
        loaded: true,
        value: data.general_visits,
      });
    }
  }, [data.general_visits]);

  useEffect(() => {
    if (data.general_users !== '') {
      setUsersBox({
        loaded: true,
        value: data.general_users,
      });
    }
  }, [data.general_users]);

  useEffect(() => {
    if (data.general_times !== '') {
      let seconds = data.general_times;
      let minutes = Math.floor(seconds / 60);
      setTimesBox({
        loaded: true,
        value: minutes,
      });
    }
  }, [data.general_times]);

  return [visitsBox, usersBox, timesBox];
};

export default useCountBoxes;
