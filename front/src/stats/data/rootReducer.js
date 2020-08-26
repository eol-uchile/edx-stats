import { combineReducers } from 'redux';
import { course, times } from '../times';

const rootReducer = combineReducers({
  course,
  times,
});

export default rootReducer;
