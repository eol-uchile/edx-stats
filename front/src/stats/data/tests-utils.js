import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';
import rootReducer from './rootReducer';

// Reference https://redux.js.org/recipes/writing-tests#connected-components
function render(
  ui,
  {
    initialState,
    store = createStore(
      rootReducer,
      (initialState = {
        urls: {
          lms: process.env.LMS_BASE_URL,
          base: process.env.BASE_URL,
          cms: process.env.CMS_BASE_URL,
          discovery: process.env.DISCOVERY_API_BASE_URL,
        },
      }),
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

// Reference https://www.rockyourcode.com/test-redirect-with-jest-react-router-and-react-testing-library/
function renderWithRouter(
  ui,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {}
) {
  return {
    ...render(<Router history={history}>{ui}</Router>),
    history,
  };
}

// re-export everything
export * from '@testing-library/react';
// override render method and add
// Router wrapper for routes
export { render, renderWithRouter };
