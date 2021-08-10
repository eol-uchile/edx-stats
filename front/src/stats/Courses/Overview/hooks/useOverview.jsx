import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

const useOverview = (data, recoverData, errors, setErrors) => {
  const course = useSelector((state) => state.course);

  const [generalData, setGeneralData] = useState({
    loaded: false,
    chapters: [],
    sequentials: [],
  });

  useEffect(() => {
    if (course.course.length !== 0) {
      let current = course.course[0];
      let chaptersWithNames = [];
      let sequentialsWithNames = [];
      current.chapters.forEach((ch, key_ch) => {
        chaptersWithNames.push({
          id: ch.id,
          name: ch.name,
        });
        ch.sequentials.forEach((seq, key_seq) => {
          sequentialsWithNames.push({
            name: seq.name,
            val: `${key_ch + 1}.${key_seq + 1}`,
          });
        });
      });
      setGeneralData({
        ...generalData,
        loaded: true,
        chapters: chaptersWithNames,
        sequentials: sequentialsWithNames,
      });
      // Load data (llena reducer)
      recoverData(current.id);
    }
    // eslint-disable-next-line
  }, [course.course]);

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
    //se llamará varias veces
    if (
      generalData.loaded &&
      data.general_times !== '' &&
      data.general_visits !== '' &&
      data.general_users !== '' &&
      errors.length === 0
    ) {
      // solo rellena datos cuando ambas peticiones,
      // al endpoint times y visits, se completaron
      setCountBox({
        ...countBox,
        values: {
          times: data.general_times,
          visits: data.general_visits,
          users: data.general_users,
        },
        loaded: true,
      });
      //setErrors([]);
    }
    if (
      generalData.loaded &&
      data.detailed_times !== '' &&
      data.detailed_visits.date !== '' &&
      data.detailed_visits.module !== '' &&
      data.detailed_visits.seq !== '' &&
      errors.length === 0
    ) {
      // solo rellena datos cuando ambas peticiones,
      // al endpoint times y visits, se completaron
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
      //setErrors([]);
    }
  }, [generalData.loaded, data]);

  return [generalData, setGeneralData, countBox, chartBox];
};

export default useOverview;
