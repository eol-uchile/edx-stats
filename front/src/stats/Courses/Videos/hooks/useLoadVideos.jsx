import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
/**
 * Recover a list of videos
 * @param {Array|String} videoList
 * @param {Function} recoverData
 * @returns
 */
const useLoadVideos = (videoList, recoverData) => {
  const course = useSelector((state) => state.course);

  const [tableData, setTableData] = useState({ loaded: false, videos: {} });

  useEffect(() => {
    if (course.course.length > 0) {
      let current = course.course[0];
      // Load data
      recoverData(current.id);
    }
    // eslint-disable-next-line
  }, [course.course]);

  useEffect(() => {
    if (videoList != '') {
      let videos = {};
      videoList.forEach(
        (v) =>
          (videos[v.block_id] = {
            duration: v.duration,
            val: v.position,
            tooltip: v.name,
          })
      );
      setTableData({ loaded: true, videos: videos });
    }
  }, [videoList]);

  return [tableData, setTableData];
};

export default useLoadVideos;
