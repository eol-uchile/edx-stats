import { combineReducers } from 'redux';
import { auth } from './reducers';
import { course, student, times, urls, visits, generalStats } from '../Courses';
import { reducers as messages } from '../Messages';

const rootReducer = combineReducers({
  course,
  student,
  times,
  auth,
  urls,
  visits,
  generalStats,
  messages,
});

export default rootReducer;
