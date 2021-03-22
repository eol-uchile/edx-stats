import { LOADED_MESSAGES, DISMISS_MESSAGE, MESSAGE_ERRORS } from './actions';

const initialState = {
  messages: [],
  read:
    localStorage.getItem('read-messages') !== null
      ? JSON.parse(localStorage.getItem('read-messages'))
      : [],
};

export default function messages(state = initialState, action) {
  switch (action.type) {
    case LOADED_MESSAGES:
      // Check if read
      let messages = action.data.filter((el) => !state.read.includes(el.id));
      console.log(messages, state.read, action.data);
      return {
        ...state,
        messages,
      };
    case MESSAGE_ERRORS:
      return {
        ...state,
        messages: [],
      };
    case DISMISS_MESSAGE:
      messages = state.messages.filter((el) => el.id !== action.data);
      let read = [...state.read, action.data];
      localStorage.setItem('read-messages', JSON.stringify(read));
      return {
        messages,
        read,
      };
    default:
      return state;
  }
}
