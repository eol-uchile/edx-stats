import React, { useState, useEffect } from 'react';
import { sortByColumn } from '../helpers';

const ROLE_WHITELIST = new Set([
  'staff',
  'data_researcher',
  'instructor',
  'administrator',
]);

const containsAtLeastOne = (list) => {
  for (let index = 0; index < list.length; index++) {
    if (ROLE_WHITELIST.has(list[index])) {
      return true;
    }
  }
  return false;
};

function useLanding(
  coursesState,
  myCourses,
  selectedCache,
  initCourses,
  setSelectedCourse
) {
  const [state, setState] = useState({
    selected: -1,
    filtered: [],
    interacted: false,
    multiGroup: [],
  });

  // Load course info only when necessary
  useEffect(() => {
    if (coursesState === 'idle') {
      initCourses();
    }
  }, []);

  // Cache the selected course
  useEffect(() => {
    if (state.filtered.length > 1 && state.selected !== -1) {
      // Removing the final condition triggers an infinite loop WTF
      let key = state.filtered[state.selected].data.key;
      if (selectedCache !== key) {
        setSelectedCourse(key);
      }
    }
  }, [state.filtered, state.selected]);

  // Set default choice only if no user interaction has ocurred
  useEffect(() => {
    if (myCourses.length > 0 && state.filtered.length > 1) {
      let selected = state.filtered.filter(
        (l) => l.data.key === selectedCache
      )[0];
      if (selected && !state.interacted) {
        setState({ ...state, selected: selected.value });
      }
    }
  }, [myCourses, selectedCache, state.filtered]);

  const parseOptions = (courses, comparator) =>
    sortByColumn(
      courses
        .filter((el) => {
          let d = new Date(el.data.end);
          let c = new Date();
          return comparator(d, c);
        })
        .map((el) => [el.label, el.value]),
      0,
      false,
      true
    ).map((el) => ({ value: el[1], label: el[0] }));

  // Update choices
  useEffect(() => {
    if (myCourses.length !== 0) {
      // Filter courses by role whitelist
      let availableCourses = myCourses
        .filter((el) => containsAtLeastOne(el.roles))
        .map((el, k) => ({
          label: `${el.title} (${el.key})`,
          value: k,
          data: el,
        }));

      let currentCourses = parseOptions(availableCourses, (a, b) => a > b);

      let pastCourses = parseOptions(availableCourses, (a, b) => a <= b);

      setState({
        ...state,
        filtered: availableCourses,
        multiGroup: [
          {
            label: 'Cursos actuales',
            options: currentCourses,
          },
          {
            label: 'Cursos archivados',
            options: pastCourses,
          },
        ],
      });
    }
  }, [myCourses]);

  return [state, setState];
}

export default useLanding;
