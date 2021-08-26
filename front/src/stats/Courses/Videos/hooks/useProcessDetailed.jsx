import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const useProcessDetailed = (
  data,
  recoverData,
  errors,
  setErrors,
  lowerDate,
  upperDate
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

  const [rowData, setRowData] = useState({
    loaded: false,
    detailed: [],
  });

  useEffect(() => {
    if (
      dataLoaded &&
      data.detailed.length !==  0
    ) {
      // setRowData({
      //   loaded: true,
      //   detailed: data.detailed
      // });
      // setErrors([]);
    }
  }, [dataLoaded, data.detailed]);

  useEffect(() => {
    if (errors.length > 0) {
      // If errors then reset the state
      setRowData({
        loaded: false,
        detailed: [],
      });
    }
  }, [errors]);

  return [dataLoaded, setDataLoaded, rowData];
};

export default useProcessDetailed;
