import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { parseSecondToTimeString } from '../../helpers';
/**
 * Manage data recovery
 * Manage list selector
 * @param {Object} courseVideos
 * @param {Array} partitionsPerUser
 * @param {Function} recoverData
 * @param {Array} errors
 * @returns
 */
const useProcessDetailed = (
  courseVideos,
  partitionsPerUser,
  recoverData,
  errors
) => {
  const course = useSelector((state) => state.course);

  const [vdSelector, setVdSelector] = useState({
    selected: 0,
    options: [{ block_id: '', duration: 0, value: '', key: 0 }],
  });

  const [rowData, setRowData] = useState({
    loaded: false,
    values: [],
  });

  useEffect(() => {
    if (courseVideos.loaded) {
      let options = [];
      Object.keys(courseVideos.videos).forEach((b, k) => {
        options.push({
          block_id: b,
          duration: courseVideos.videos[b].duration,
          value: `${courseVideos.videos[b].val} ${courseVideos.videos[b].tooltip}`,
          key: k,
        });
      });
      setVdSelector({
        selected: 0,
        options: options,
      });
    }
  }, [courseVideos.loaded]);

  useEffect(() => {
    if (
      course.course.length > 0 &&
      vdSelector.options[vdSelector.selected].block_id !== ''
    ) {
      let current = course.course[0];
      // Load data
      recoverData(current.id, vdSelector.options[vdSelector.selected].block_id);
      setRowData({
        loaded: false,
        values: [],
      });
    }
    // eslint-disable-next-line
  }, [course.course, vdSelector]);

  useEffect(() => {
    if (
      courseVideos.loaded &&
      partitionsPerUser.length > 0 &&
      errors.length === 0
    ) {
      let videoPartitions = {};
      // For each user
      // and for each second watched by the user
      // we create a key with the current second and
      // two values for the unique and repeated replays.
      // We add one to the unique value and
      // (the number of times watched by the user - 1) to the repetitions
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
      for (
        var i = 0;
        i <= vdSelector.options[vdSelector.selected].duration;
        i++
      ) {
        points.push({
          second: parseSecondToTimeString(i),
          Visualizaciones: videoPartitions[i] ? videoPartitions[i].unique : 0,
          Repeticiones: videoPartitions[i] ? videoPartitions[i].repetition : 0,
        });
      }
      setRowData({
        values: points,
        loaded: true,
      });
    }
  }, [courseVideos.loaded, partitionsPerUser]);

  useEffect(() => {
    if (errors.length > 0) {
      // If errors then reset the state
      setRowData({
        values: [],
        loaded: true,
      });
    }
  }, [errors]);

  return [vdSelector, setVdSelector, rowData, setRowData];
};

export default useProcessDetailed;
