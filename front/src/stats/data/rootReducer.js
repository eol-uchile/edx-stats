import { combineReducers } from 'redux';
import { course, times, auth, urls } from '../times';

const rootReducer = combineReducers({
  course,
  times,
  auth,
  urls,
});

export default rootReducer;
