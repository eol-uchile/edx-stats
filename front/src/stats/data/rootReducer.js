import { combineReducers } from 'redux';
import { course, times, auth, urls, visits, dashboard } from '../Overview';

const rootReducer = combineReducers({
  course,
  times,
  auth,
  urls,
  visits,
  dashboard,
});

export default rootReducer;
