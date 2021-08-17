import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

const TODAY = new Date();

const getDate = (dateISOString, d = 0) => {
  let date = new Date(dateISOString);
  let inMiliseconds = Date.parse(date);
  let DAY_IN_MILISECS = 24 * 60 * 60 * 1000;
  let finalDate = new Date(inMiliseconds + d * DAY_IN_MILISECS);
  return finalDate;
};

const isIntoCourse = (date, l, u) => {
  let isStarted = date >= new Date(l);
  let isFinished = date > new Date(u);
  return isStarted && !isFinished;
};

const useChartBoxes = (
  data,
  recoverData,
  errors,
  setErrors,
  isAllowed,
  viewModules
) => {
  const course = useSelector((state) => state.course);

  const [dataLoaded, setDataLoaded] = useState({
    loaded: false,
    upperDate: TODAY.toISOString(),
    lowerDate: getDate(TODAY.toISOString(), -7).toISOString(),
  });

  useEffect(() => {
    if (isAllowed && course.course.length !== 0) {
      let current = course.course[0];
      setDataLoaded({
        ...dataLoaded,
        loaded: true,
      });
      // Load data
      recoverData(
        current.id,
        new Date(dataLoaded.lowerDate),
        new Date(dataLoaded.upperDate)
      );
    }
    // eslint-disable-next-line
  }, [course.course, dataLoaded.upperDate, dataLoaded.lowerDate]);

  const [dataLine, setDataLine] = useState([]);

  useEffect(() => {
    if (
      dataLoaded.loaded &&
      data.detailed_times !== '' &&
      data.detailed_visits.date !== ''
    ) {
      let dailyMinutes = data.detailed_times.map((t, k) => ({
        date: t.time.slice(0, 10),
        Tiempo: Math.floor(t.total / 60),
      }));
      let dailyVisits = data.detailed_visits.date.map((v, k) => ({
        date: v.time.slice(0, 10),
        Visitas: v.total,
      }));

      let concat = dailyMinutes.concat(dailyVisits);
      let dailyStats = concat.reduce(function (output, cur) {
        // Get the index of the key-value pair.
        var occurs = output.reduce(function (n, item, i) {
          return item.date === cur.date ? i : n;
        }, -1);
        // If the date is found,
        if (occurs >= 0) {
          // set the current value Visitas to its Visitas field
          output[occurs].Visitas = cur.Visitas;
          // Otherwise,
        } else {
          // add the current item to output
          cur.Visitas = 0;
          output = output.concat([cur]);
        }
        return output;
      }, []);
      let sortedAscending = dailyStats.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
      });
      setDataLine(sortedAscending);
      setErrors([]);
    }
  }, [dataLoaded, data.detailed_times, data.detailed_visits.date]);

  const [dataPie, setDataPie] = useState([]);

  useEffect(() => {
    if (
      dataLoaded.loaded &&
      data.detailed_visits.module !== '' &&
      data.detailed_visits.seq !== ''
    ) {
      let unnamedPortions = viewModules
        ? data.detailed_visits.module
        : data.detailed_visits.seq;
      let circularPortions = [];
      unnamedPortions.forEach((v, k) => {
        let name = viewModules
          ? v.name
          : `${v.chap_number}.${v.seq_number} : ${v.name}`;
        let namedPortion = {
          name: name,
          value: v.total,
        };
        circularPortions.push(namedPortion);
      });
      setDataPie(circularPortions);
      setErrors([]);
    }
  }, [
    dataLoaded,
    viewModules,
    data.detailed_visits.module,
    data.detailed_visits.seq,
  ]);

  useEffect(() => {
    if (errors.length > 0) {
      // If errors then reset the state
      setDataLoaded({ ...dataLoaded, loaded: true });
      setDataLine([]);
      setDataPie([]);
    }
  }, [errors]);

  return [dataLoaded, setDataLoaded, dataLine, dataPie];
};

export default useChartBoxes;
