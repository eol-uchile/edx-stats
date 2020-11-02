import { combineReducers } from 'redux';
import { course, times, auth, urls, visits } from '../Overview';

const rootReducer = combineReducers({
  course,
  times,
  auth,
  urls,
  visits,
});

export default rootReducer;
