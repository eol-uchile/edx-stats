import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const useLoadVideos = (data, recoverData) => {
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

  const [rowData, setRowData] = useState({ loaded: false, videos: {} });

  useEffect(() => {
    if (dataLoaded && data.video_list != '') {
      let videos = {};
      data.video_list.forEach(
        (v) =>
          (videos[v.block_id] = {
            duration: v.duration,
            position: v.position,
            name: v.name,
          })
      );
      setRowData({ loaded: true, videos: videos });
    }
  }, [dataLoaded, data.video_list]);
  return [rowData, setRowData];
};

export default useLoadVideos;
