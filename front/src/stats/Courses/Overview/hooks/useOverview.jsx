import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

const useOverview = (
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
    values: {
      times: 0,
      visits: 0,
      users: 0,
    },
  });

  const [chartBox, setChartBox] = useState({
    loaded: false,
    values: {
      week_times: [],
      week_visits: [],
      module_visits: [],
      seq_visits: [],
    },
  });

  useEffect(() => {
    // Groups CountBox and ChartBox in one useEffect
    // It calls himself at least twice
    if (
      dataLoaded &&
      data.general_times !== '' &&
      data.general_visits !== '' &&
      data.general_users !== '' &&
      errors.length === 0
    ) {
      // recoverCourseGeneralTimes and recoverCourseGeneralVisits
      setCountBox({
        ...countBox,
        values: {
          times: data.general_times,
          visits: data.general_visits,
          users: data.general_users,
        },
        loaded: true,
      });
      setErrors([]);
    }
    if (
      dataLoaded &&
      data.detailed_times !== '' &&
      data.detailed_visits.date !== '' &&
      data.detailed_visits.module !== '' &&
      data.detailed_visits.seq !== '' &&
      errors.length === 0
    ) {
      // recoverCourseDetailedTimes and recoverCourseDetailedVisits
      setChartBox({
        ...chartBox,
        values: {
          week_times: data.detailed_times,
          week_visits: data.detailed_visits.date,
          module_visits: data.detailed_visits.module,
          seq_visits: data.detailed_visits.seq,
        },
        loaded: true,
      });
      setErrors([]);
    }
  }, [dataLoaded, data]);

  useEffect(() => {
    if (errors.length > 0) {
      // If errors then reset the state
      setCountBox({
        ...countBox,
        loaded: true,
        values: {
          times: 0,
          visits: 0,
          users: 0,
        },
      });
      setChartBox({
        ...chartBox,
        loaded: true,
        values: {
          week_times: [],
          week_visits: [],
          module_visits: [],
          seq_visits: [],
        },
      });
    }
  }, [errors]);

  return [dataLoaded, setDataLoaded, countBox, chartBox];
};

export default useOverview;
