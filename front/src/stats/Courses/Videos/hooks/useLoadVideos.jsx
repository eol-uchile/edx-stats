import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const useLoadVideos = ({ data, recoverData }) => {
  const course = useSelector((state) => state.course);

  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (course.course.length !== 0) {
      let current = course.course[0];
      setDataLoaded(true);
      // Load data
      recoverData(current.id);
    }
    // eslint-disable-next-line
  }, [course.course]);

  const [videoSelector, setVideoSelector] = useState({
    selected: '',
    options: [],
  });

  useEffect(() => {
    if (dataLoaded && data.videos.length > 0) {
      // let options = data.videos.map((v, k) => ({
      //   block_id: v.block_id,
      //   value: `${v.position} : ${v.name}`,
      //   key: k,
      // }));

      // setVideoSelector({
      //   options: options,
      //   selected: 0,
      // });
    }
  }, [dataLoaded, data.videos]);
  return [videoSelector, setVideoSelector];
};

export default useLoadVideos;
