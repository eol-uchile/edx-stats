import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { waitFor, screen, renderWithRouter } from '../../data/tests-utils';
import TimesTable from '../TimesTable';
// Mock calls to the Edx modules
import * as frontenAuth from '@edx/frontend-platform/auth';
jest.mock('@edx/frontend-platform/auth');

const course_data = {
  key: 'foo_id',
  end: '2019-02-02',
  start: '2019-02-01',
  title: 'foo',
  blocks_url:
    'https://eol.andhael.cl/api/courses/v2/blocks/?course_id=course-v1%3AUChile%2BKUBER1%2B2020_T2',
  effort: null,
  enrollment_start: null,
  enrollment_end: null,
  course_video: {
    uri: null,
  },
  image: {
    src:
      'https://eol.andhael.cl/asset-v1:UChile+KUBER1+2020_T2+type@asset+block@images_course_image.jpg',
  },
  number: 'KUBER1',
  org: 'UChile',
  short_description: '',
  start_display: '1 de Octubre de 2020',
  start_type: 'timestamp',
  pacing: 'instructor',
  mobile_available: false,
  hidden: false,
  invitation_only: false,
  course_id: 'foo_id',
};

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
    if (url.includes('/api/times/timeoncourse')) {
      return Promise.reject({
        customAttributes: { httpErrorResponseData: 'Custom error message' },
      });
    } else if (url.includes('/api/enrollment/v1/roles')) {
      return Promise.resolve({
        status: 200,
        request: { responseURL: '' },
        data: { roles: [{ course_id: 'foo_id', role: 'foo' }] },
      });
    } else if (url.includes('/api/courses/v1/courses/?page_size=200')) {
      return Promise.resolve({
        status: 200,
        request: { responseURL: '' },
        data: {
          results: [course_data],
        },
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
    course_id: 'foo_id',
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
  renderWithRouter(<TimesTable match={mock_router_path} data={{}} />);

  expect(screen.getByTestId('times-lDate'));
  expect(screen.getByTestId('times-uDate'));
  expect(screen.getByText('Buscar'));
});

it('renders prop dates without crashing', () => {
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue(mock_empty_response);
  renderWithRouter(<TimesTable match={mock_router_path} data={{}} />);

  expect(screen.getByTestId('times-lDate')).toHaveValue('2019-09-04');
  expect(screen.getByTestId('times-uDate')).toHaveValue('2019-09-05');
  expect(screen.getByText('Buscar'));
});

it('shows error when fetch fails', async () => {
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue(mock_server_error);

  renderWithRouter(<TimesTable match={mock_router_path} data={{}} />);

  userEvent.type(screen.getByTestId('times-lDate'), '2019-09-04');
  userEvent.type(screen.getByTestId('times-uDate'), '2019-09-05');
  userEvent.click(screen.getByRole('button'));
  await waitFor(() =>
    expect(frontenAuth.getAuthenticatedHttpClient).toHaveBeenCalledTimes(3)
  );
  expect(screen.getByText('Hubo un error en el servidor'));
});

it('dismisses error messages', async () => {
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue(mock_server_error);

  renderWithRouter(<TimesTable match={mock_router_path} data={{}} />);

  userEvent.type(screen.getByTestId('times-lDate'), '2019-09-04');
  userEvent.type(screen.getByTestId('times-uDate'), '2019-09-05');
  userEvent.click(screen.getByRole('button'));
  await waitFor(() =>
    expect(frontenAuth.getAuthenticatedHttpClient).toHaveBeenCalledTimes(3)
  );
  expect(screen.getByText('Hubo un error en el servidor'));

  screen.getAllByText('×').forEach((element) => {
    userEvent.click(element);
  });
  expect(
    screen.queryByText('Hubo un error en el servidor')
  ).not.toBeInTheDocument();
});

it('gets table values', async () => {
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue(mock_course_response);

  renderWithRouter(<TimesTable match={mock_router_path} />);

  userEvent.type(screen.getByTestId('times-lDate'), '2019-09-04');
  userEvent.type(screen.getByTestId('times-uDate'), '2019-09-05');
  userEvent.click(screen.getByRole('button'));
  await waitFor(() =>
    expect(frontenAuth.getAuthenticatedHttpClient).toHaveBeenCalledTimes(4)
  );
  expect(screen.getByText('Ch1'));
  expect(screen.getByText('Custom error message'));
});

it('has a second view mode', async () => {
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue(mock_course_response);

  renderWithRouter(<TimesTable match={mock_router_path} />);

  userEvent.type(screen.getByTestId('times-lDate'), '2019-09-04');
  userEvent.type(screen.getByTestId('times-uDate'), '2019-09-05');
  userEvent.click(screen.getByRole('button'));
  await waitFor(() =>
    expect(frontenAuth.getAuthenticatedHttpClient).toHaveBeenCalledTimes(4)
  );
  expect(screen.getByText('Ch1'));
  expect(screen.getByText('Custom error message'));

  userEvent.click(screen.getByLabelText('Agrupar Módulos'));
  expect(screen.getByText('1.1'));
});
