import { combineReducers } from 'redux';
import { auth } from './reducers';
import { course, times, urls, visits, videos, generalStats } from '../Courses';
import { reducers as messages } from '../Messages';

const rootReducer = combineReducers({
  course,
  times,
  auth,
  urls,
  visits,
  videos,
  generalStats,
  messages,
});

export default rootReducer;
