import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import {
  render,
  waitFor,
  screen,
  renderWithRouter,
} from '../../data/tests-utils';
import VisitsTable from '../components/VisitsTable';
// Mock calls to the Edx modules
import * as frontenAuth from '@edx/frontend-platform/auth';
jest.mock('@edx/frontend-platform/auth');

const structureData = {
  courses: [
    {
      name: 'Test',
      id: 'block-v1:Test_T2',
      chapters: [
        {
          name: 'Ch1',
          sequentials: [
            {
              name: 's1',
              verticals: [{ name: 'v1', block_id: 'b1', vertical_id: 'v1a' }],
            },
          ],
        },
        {
          name: 'Ch2',
          sequentials: [
            {
              name: 's21',
              verticals: [
                { name: 'v21', block_id: 'b21', vertical_id: 'v21a' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const mock_empty_response = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
};

const mock_server_error = {
  get: jest.fn(() => Promise.reject('Hubo un error en el servidor')),
};

const mock_course_response = {
  get: jest.fn((url) => {
    if (url.includes('/api/visits/visitsoncourse')) {
      return Promise.reject({
        customAttributes: { httpErrorResponseData: 'Custom error message' },
      });
    } else {
      return Promise.resolve({
        status: 200,
        request: { responseURL: '' },
        data: structureData,
      });
    }
  }),
};

const mock_router_path = {
  params: {
    course_id: 'foo',
    start: '2019-09-04',
    end: '2019-09-05',
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('renders without crashing', () => {
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue(mock_empty_response);
  renderWithRouter(<VisitsTable match={mock_router_path} data={{}} />);

  expect(screen.getByTestId('visits-lDate'));
  expect(screen.getByTestId('visits-uDate'));
  expect(screen.getByText('Buscar'));
});

it('renders prop dates without crashing', () => {
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue(mock_empty_response);
  renderWithRouter(<VisitsTable match={mock_router_path} data={{}} />);

  expect(screen.getByTestId('visits-lDate')).toHaveValue('2019-09-04');
  expect(screen.getByTestId('visits-uDate')).toHaveValue('2019-09-05');
  expect(screen.getByText('Buscar'));
});

it('shows error when fetch fails', async () => {
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue(mock_server_error);

  renderWithRouter(<VisitsTable match={mock_router_path} data={{}} />);

  userEvent.type(screen.getByTestId('visits-lDate'), '2019-09-04');
  userEvent.type(screen.getByTestId('visits-uDate'), '2019-09-05');
  userEvent.click(screen.getByRole('button'));
  await waitFor(() =>
    expect(frontenAuth.getAuthenticatedHttpClient).toHaveBeenCalledTimes(1)
  );
  expect(screen.getByText('Hubo un error en el servidor'));
});

it('dismisses error messages', async () => {
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue(mock_server_error);

  renderWithRouter(<VisitsTable match={mock_router_path} data={{}} />);

  userEvent.type(screen.getByTestId('visits-lDate'), '2019-09-04');
  userEvent.type(screen.getByTestId('visits-uDate'), '2019-09-05');
  userEvent.click(screen.getByRole('button'));
  await waitFor(() =>
    expect(frontenAuth.getAuthenticatedHttpClient).toHaveBeenCalledTimes(1)
  );
  expect(screen.getByText('Hubo un error en el servidor'));

  userEvent.click(screen.getByRole('alert'));
  expect(
    screen.queryByText('Hubo un error en el servidor')
  ).not.toBeInTheDocument();
});

it('gets table values', async () => {
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue(mock_course_response);

  renderWithRouter(
    <VisitsTable match={mock_router_path} data={{ name: 'foo' }} />
  );

  userEvent.type(screen.getByTestId('visits-lDate'), '2019-09-04');
  userEvent.type(screen.getByTestId('visits-uDate'), '2019-09-05');
  userEvent.click(screen.getByRole('button'));
  await waitFor(() =>
    expect(frontenAuth.getAuthenticatedHttpClient).toHaveBeenCalledTimes(2)
  );
  expect(screen.getByText('Ch1'));
  expect(screen.getByText('Custom error message'));
});

it('has a second view mode', async () => {
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue(mock_course_response);

  renderWithRouter(
    <VisitsTable match={mock_router_path} data={{ name: 'foo' }} />
  );

  userEvent.type(screen.getByTestId('visits-lDate'), '2019-09-04');
  userEvent.type(screen.getByTestId('visits-uDate'), '2019-09-05');
  userEvent.click(screen.getByRole('button'));
  await waitFor(() =>
    expect(frontenAuth.getAuthenticatedHttpClient).toHaveBeenCalledTimes(2)
  );
  expect(screen.getByText('Ch1'));
  expect(screen.getByText('Custom error message'));

  userEvent.click(screen.getByLabelText('Agrupar Módulos'));
  expect(screen.getByText('1.1'));
});
