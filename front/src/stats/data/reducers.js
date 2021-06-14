import { DO_LOGIN } from '../Courses/data/types';
export const REFRESH_LOGIN = 'REFRESH_LOGIN';
export const REFRESH_ERROR = 'REFRESH_ERROR';

const initialAuthState = {
  doLogin: false,
};

export function auth(state = initialAuthState, action) {
  switch (action.type) {
    case DO_LOGIN:
      return { ...state, doLogin: true };
    case REFRESH_LOGIN:
      return state;
    default:
      return state;
  }
}
