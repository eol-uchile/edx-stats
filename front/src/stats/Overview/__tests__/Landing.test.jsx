import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '../../data/tests-utils';
import Landing from '../Landing';
// Mock calls to the Edx modules
import * as frontenAuth from '@edx/frontend-platform/auth';
import userEvent from '@testing-library/user-event';
jest.mock('@edx/frontend-platform/auth');

const mock_empty_resolve = {
  get: jest.fn((url) => {
    if (url.includes('/api/enrollment/v1/roles')) {
      return Promise.resolve({
        status: 200,
        request: { responseURL: '' },
        data: { roles: [{ course_id: 'foo_id', role: 'foo' }] },
      });
    } else if (
      url.includes('/api/v1/course_runs/?format=json&limit=200&offset=0')
    ) {
      return Promise.resolve({
        status: 200,
        request: { responseURL: '' },
        data: {
          results: [],
          count: 0,
        },
      });
    }
  }),
};

const mock_error_resposne = {
  get: jest.fn((url) => {
    if (url.includes('/api/enrollment/v1/roles')) {
      return Promise.resolve({
        status: 200,
        request: { responseURL: '' },
        data: { roles: [] },
      });
    } else if (
      url.includes('/api/v1/course_runs/?format=json&limit=200&offset=0')
    ) {
      return Promise.resolve({
        status: 400,
        request: { responseURL: '' },
        data: {
          results: [],
          count: 0,
        },
      });
    }
  }),
};

const mock_foo_course = {
  get: jest.fn((url) => {
    if (url.includes('/api/enrollment/v1/roles')) {
      return Promise.resolve({
        status: 200,
        request: { responseURL: '' },
        data: { roles: [{ course_id: 'foo_id', role: 'foo' }] },
      });
    } else if (
      url.includes('/api/v1/course_runs/?format=json&limit=200&offset=0')
    ) {
      return Promise.resolve({
        status: 200,
        request: { responseURL: '' },
        data: {
          results: [
            {
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
            },
          ],
          count: 1,
        },
      });
    }
  }),
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('renders without crashing', () => {
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue(mock_empty_resolve);
  render(<Landing />);
  expect(screen.getByText('Cargando cursos ...'));
});

it('renders errors on API failure', async () => {
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue(mock_error_resposne);
  render(<Landing />);
  await waitFor(() =>
    expect(frontenAuth.getAuthenticatedHttpClient).toHaveBeenCalledTimes(2)
  );
  expect(
    screen.getByText(
      'Hubo un error al obtener la información de los cursos. Por favor intente más tarde.'
    )
  );
});

it('displays default option', async () => {
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue(mock_empty_resolve);
  render(<Landing />);
  await waitFor(() =>
    expect(frontenAuth.getAuthenticatedHttpClient).toHaveBeenCalledTimes(2)
  );
  expect(screen.getByText('Mis cursos'));
  const optionInput = await screen.findByText('- Seleccionar curso -');
  expect(optionInput).toHaveValue('-1');
});

it.skip('displays multiple options', async () => {
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue(mock_foo_course);
  render(<Landing />);
  await waitFor(() =>
    expect(frontenAuth.getAuthenticatedHttpClient).toHaveBeenCalledTimes(2)
  );
  expect(screen.getByText('Mis cursos'));
  const optionInput = await screen.findByText('foo (foo_id)');
  expect(optionInput).toHaveValue('0');
});
