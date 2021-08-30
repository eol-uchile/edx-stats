import 'babel-polyfill';
import { server } from './tests/server';

// Create a similar Axios Http Client to the one used by Edx
import axios from 'axios';
import * as frontenAuth from '@edx/frontend-platform/auth';
import createProcessAxiosRequestErrorInterceptor from '@edx/frontend-platform/auth/interceptors/createProcessAxiosRequestErrorInterceptor';
jest.mock('@edx/frontend-platform/auth');

const processAxiosRequestErrorInterceptor = createProcessAxiosRequestErrorInterceptor(
  {
    loggingService: { logInfo: () => { } },
  }
);

const httpClient = axios;
httpClient.interceptors.response.use(
  (response) => response,
  processAxiosRequestErrorInterceptor
);

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};

global.localStorage = localStorageMock;
global.localStorage.setItem('tutorial-overview', 'seen');
global.localStorage.setItem('tutorial-visitstable', 'seen');
global.localStorage.setItem('tutorial-timestable', 'seen');

beforeAll(() => {
  server.listen();
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue(httpClient);
});

// if you need to add a handler after calling setupServer for some specific test
// this will remove that handler for the rest of them
// (which is important for test isolation):

afterEach(() => server.resetHandlers());

afterAll(() => server.close());