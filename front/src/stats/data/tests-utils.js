import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from 'react-redux';
import rootReducer from './rootReducer';

// Reference https://redux.js.org/recipes/writing-tests#connected-components

function render(
  ui,
  {
    initialState,
    store = createStore(
      rootReducer,
      initialState,
      composeWithDevTools(applyMiddleware(thunk))
    ),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from '@testing-library/react';
// override render method
export { render };
