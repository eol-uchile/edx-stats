import React from 'react';
import '@testing-library/jest-dom';
import {
  render,
  renderWithRouter,
  screen,
  waitFor,
} from '../../data/tests-utils';
import { server, rest, urls } from '../../../tests/server';
import Landing from '../Landing';
import userEvent from '@testing-library/user-event';

it('renders without crashing', () => {
  render(<Landing />);
  expect(screen.getByText('Cargando cursos'));
});

it('renders errors on LMS API failure', async () => {
  server.use(
    rest.get(
      `${urls.lms_url}/api/enrollment/v1/roles/`,
      async (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ message: 'test error  message' })
        );
      }
    )
  );
  render(<Landing />);
  expect(screen.getByText('Cargando cursos'));
  await waitFor(() =>
    screen.findByText(
      'Hubo un error al obtener sus cursos. Por favor intente más tarde.'
    )
  );
  expect(
    screen.getByText(
      'Hubo un error al obtener sus cursos. Por favor intente más tarde.'
    )
  );
});

it('renders errors on Discovery API failure', async () => {
  server.use(
    rest.get(
      `${urls.discovery_url}/api/v1/course_runs/*`,
      async (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ message: 'test error  message' })
        );
      }
    )
  );
  render(<Landing />);
  expect(screen.getByText('Cargando cursos'));
  await waitFor(() =>
    screen.findByText(
      'Hubo un error al obtener sus cursos. Por favor intente más tarde.'
    )
  );
  expect(
    screen.getByText(
      'Hubo un error al obtener sus cursos. Por favor intente más tarde.'
    )
  );
});

it('displays a default option', async () => {
  server.use(
    rest.get(
      `${urls.discovery_url}/api/v1/course_runs/*`,
      async (req, res, ctx) => {
        return res(
          ctx.json({
            count: 0,
            next: null,
            previous: null,
            results: [],
          })
        );
      }
    )
  );
  render(<Landing />);
  expect(screen.getByText('Cargando cursos'));
  await waitFor(() => screen.findByText('- Seleccionar curso -'));
  expect(screen.getByText('- Seleccionar curso -'));
});

it('displays multiple options', async () => {
  render(<Landing />);
  expect(screen.getByText('Cargando cursos'));
  await waitFor(() => screen.findByText('- Seleccionar curso -'));
  expect(screen.getByText('- Seleccionar curso -'));
  const optionInput = await screen.findByText(
    'Boletas para todos (course-v1:UChile+BOL+2020_D)'
  );
});

it('renders no avaible courses message on LMS API empty response', async () => {
  server.use(
    rest.get(
      `${urls.lms_url}/api/enrollment/v1/roles/`,
      async (req, res, ctx) => {
        return res(ctx.json({ roles: [] }));
      }
    )
  );
  render(<Landing />);
  expect(screen.getByText('Cargando cursos'));
  await waitFor(() => screen.findByText('No hay cursos disponibles'));
});

it('displays next pages on select item', async () => {
  renderWithRouter(<Landing />);
  expect(screen.getByText('Cargando cursos'));
  await waitFor(() => screen.findByText('- Seleccionar curso -'));
  expect(screen.getByText('- Seleccionar curso -'));
  const optionInput = screen.getByTestId('courses-select');
  userEvent.selectOptions(optionInput, '3');
  expect(screen.getByText('Ver Curso'));
  expect(screen.getByText('Consultar'));
});
