import { combineReducers } from 'redux';
import { auth } from './reducers';
import { course, times, urls, visits } from '../Courses';
import { reducers as messages } from '../Messages';

const rootReducer = combineReducers({
  course,
  times,
  auth,
  urls,
  visits,
  messages,
});

export default rootReducer;
