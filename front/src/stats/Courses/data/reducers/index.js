import { course } from './course';

/**
 * Dummy Url holder on Redux
 * @param {*} state
 * @param {*} action
 */
function urls(state = { lms: '', base: '', discovery: '' }, action) {
  return state;
}

export { course, urls };
