import 'babel-polyfill';
import axios from 'axios';
import * as frontenAuth from '@edx/frontend-platform/auth';
jest.mock('@edx/frontend-platform/auth');

import { server } from './tests/server';

beforeAll(() => {
  server.listen();
  jest.spyOn(frontenAuth, 'getAuthenticatedHttpClient').mockReturnValue(axios);
});

// if you need to add a handler after calling setupServer for some specific test
// this will remove that handler for the rest of them
// (which is important for test isolation):

afterEach(() => server.resetHandlers());

afterAll(() => server.close());
