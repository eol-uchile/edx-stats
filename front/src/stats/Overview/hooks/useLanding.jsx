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
    filtered: [{ label: '- Seleccionar curso -', value: -1 }],
    interacted: false,
    options: [['- Seleccionar curso -', -1]],
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
      let selected = state.filtered
        .slice(1)
        .filter((l) => l.data.key === selectedCache)[0];
      if (selected && !state.interacted) {
        setState({ ...state, selected: selected.value });
      }
    }
  }, [myCourses, selectedCache, state.filtered]);

  // Update choices
  useEffect(() => {
    if (myCourses.length !== 0) {
      let availableCourses = myCourses
        .filter((el) => containsAtLeastOne(el.roles))
        .map((el, k) => ({
          label: `${el.title} (${el.key})`,
          value: k,
          data: el,
        }));
      let options = sortByColumn(
        availableCourses.map((el) => [el.label, el.value]),
        0,
        false,
        true
      );
      setState({
        ...state,
        filtered: availableCourses,
        options: [['- Seleccionar curso -', -1], ...options],
      });
    }
  }, [myCourses]);

  return [state, setState];
}

export default useLanding;
