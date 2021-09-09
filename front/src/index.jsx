import 'babel-polyfill';

import {
  APP_INIT_ERROR,
  APP_READY,
  subscribe,
  initialize,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import React from 'react';
import ReactDOM from 'react-dom';

import Header, {
  messages as headerMessages,
} from './frontend-component-header/dist';
import Footer, {
  messages as footerMessages,
} from '@edx/frontend-component-footer';

import appMessages from './i18n';

import 'font-awesome/css/font-awesome.min.css';
import './index.scss';
import './assets/favicon.png';
import { Routes, configureStore, Message } from './stats';

import footerLogo from './assets/0vti.ef83f16aa682.jpg';

/**
 * Recover the URLs from here at startup
 *
 * The other options is to pass the URLs directly to each action
 * by using the Context API to inject it as an argument for each action.
 * Doing it here makes the components agnostic to this problem and less verbose
 */
const store = configureStore({
  urls: {
    lms: process.env.LMS_BASE_URL,
    base: process.env.BASE_URL,
    cms: process.env.CMS_BASE_URL,
    discovery: process.env.DISCOVERY_API_BASE_URL,
  },
});

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider store={store}>
      <Header />
      <Routes />
      <Message />
      <Footer logo={footerLogo} />
    </AppProvider>,
    document.getElementById('root')
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(
    <ErrorPage message={error.message} />,
    document.getElementById('root')
  );
});

initialize({
  messages: [appMessages, headerMessages, footerMessages],
  requireAuthenticatedUser: true,
});
