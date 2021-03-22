import { combineReducers } from 'redux';
import { course, times, auth, urls, visits, dashboard } from '../Overview';
import { reducers as messages } from '../Messages';

const rootReducer = combineReducers({
  course,
  times,
  auth,
  urls,
  visits,
  dashboard,
  messages,
});

export default rootReducer;
