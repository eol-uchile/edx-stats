import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { render, fireEvent, waitFor, screen } from '../../data/tests-utils';
import TimesTable from '../TimesTable';
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

beforeEach(() => {
  jest.clearAllMocks();
});

it('renders without crashing', () => {
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue({ get: jest.fn(() => Promise.resolve({ data: {} })) });
  render(<TimesTable match={{ params: {} }} />);
  expect(screen.getByRole('searchbox')).toBeInTheDocument();
  expect(screen.getByText('No hay datos para el curso')).toBeInTheDocument();
});

it('shows error when fetch fails', async () => {
  jest.spyOn(frontenAuth, 'getAuthenticatedHttpClient').mockReturnValue({
    get: jest.fn(() => Promise.reject('Hubo un error en el servidor')),
  });

  render(<TimesTable match={{ params: {} }} />);

  userEvent.type(screen.getByRole('searchbox'), 'Test');
  expect(screen.getByRole('searchbox')).toHaveValue('Test');
  fireEvent.submit(screen.getByRole('searchbox'));
  await waitFor(() =>
    expect(frontenAuth.getAuthenticatedHttpClient).toHaveBeenCalledTimes(1)
  );
  expect(screen.getByText('Hubo un error en el servidor')).toBeInTheDocument();
});

it('dismisses error messages', async () => {
  jest.spyOn(frontenAuth, 'getAuthenticatedHttpClient').mockReturnValue({
    get: jest.fn(() => Promise.reject('Hubo un error en el servidor')),
  });

  render(<TimesTable match={{ params: {} }} />);

  userEvent.type(screen.getByRole('searchbox'), 'Test');
  expect(screen.getByRole('searchbox')).toHaveValue('Test');
  fireEvent.submit(screen.getByRole('searchbox'));
  await waitFor(() =>
    expect(frontenAuth.getAuthenticatedHttpClient).toHaveBeenCalledTimes(1)
  );

  expect(screen.getByText('Hubo un error en el servidor')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('alert'));
  expect(
    screen.queryByText('Hubo un error en el servidor')
  ).not.toBeInTheDocument();
});

it('gets table values', async () => {
  jest.spyOn(frontenAuth, 'getAuthenticatedHttpClient').mockReturnValue({
    get: jest.fn((url) => {
      if (url.includes('/api/courses/times')) {
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
  });

  render(<TimesTable match={{ params: {} }} />);

  userEvent.type(screen.getByRole('searchbox'), 'Test');
  fireEvent.submit(screen.getByRole('searchbox'));
  await waitFor(() =>
    expect(frontenAuth.getAuthenticatedHttpClient).toHaveBeenCalledTimes(2)
  );
  expect(screen.getByText('1.1')).toBeInTheDocument();
  expect(screen.getByText('Custom error message')).toBeInTheDocument();
});

it('has a second view mode', async () => {
  jest.spyOn(frontenAuth, 'getAuthenticatedHttpClient').mockReturnValue({
    get: jest.fn((url) => {
      if (url.includes('/api/courses/times')) {
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
  });

  render(<TimesTable match={{ params: {} }} />);

  userEvent.type(screen.getByRole('searchbox'), 'Test');
  fireEvent.submit(screen.getByRole('searchbox'));
  await waitFor(() =>
    expect(frontenAuth.getAuthenticatedHttpClient).toHaveBeenCalledTimes(2)
  );
  expect(screen.getByText('1.1')).toBeInTheDocument();
  expect(screen.getByText('Custom error message')).toBeInTheDocument();

  userEvent.click(screen.getByLabelText('Agrupar Módulos'));
  expect(screen.queryByText('1.1')).not.toBeInTheDocument();
});
