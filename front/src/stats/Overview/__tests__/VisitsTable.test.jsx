import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { waitFor, screen, renderWithRouter } from '../../data/tests-utils';
import VisitsTable from '../VisitsTable';
// Mock calls to the Edx modules
import { server, rest, urls } from '../../../tests/server';

const mock_router_path = {
  params: {
    course_id: 'course-v1:UChile+LEIT01+2020_T3',
    start: '2019-07-27',
    end: '2019-12-22',
  },
};

it('renders without crashing', () => {
  renderWithRouter(<VisitsTable match={mock_router_path} />);
  expect(screen.getByTestId('visits-lDate'));
  expect(screen.getByTestId('visits-uDate'));
  expect(screen.getByText('Buscar'));
});

it('renders prop dates without crashing', () => {
  renderWithRouter(<VisitsTable match={mock_router_path} />);
  expect(screen.getByTestId('visits-lDate')).toHaveValue('2019-07-27');
  expect(screen.getByTestId('visits-uDate')).toHaveValue('2019-12-22');
});

it('shows error when fetch fails', async () => {
  server.use(
    rest.get(
      `${urls.base_url}/api/core/course-structure/*`,
      async (req, res, ctx) => {
        return res(ctx.status(403));
      }
    )
  );
  renderWithRouter(<VisitsTable match={mock_router_path} />);
  await waitFor(() => expect(screen.getByText('Hubo un error en el servidor')));
});

it('displays no permissions message for not allowed courses', async () => {
  renderWithRouter(
    <VisitsTable
      match={{
        params: {
          course_id: 'course_foo',
          start: '2019-07-27',
          end: '2019-12-22',
        },
      }}
    />
  );
  await waitFor(() =>
    expect(
      screen.getByText('No tienes permiso para ver los datos de este curso.')
    )
  );
});

it('dismisses error messages', async () => {
  server.use(
    rest.get(
      `${urls.base_url}/api/core/course-structure/*`,
      async (req, res, ctx) => {
        return res(ctx.status(403));
      }
    )
  );
  renderWithRouter(<VisitsTable match={mock_router_path} />);
  await waitFor(() => expect(screen.getByText('Hubo un error en el servidor')));
  screen.getAllByText('×').forEach((element) => {
    userEvent.click(element);
  });
  await waitFor(() =>
    expect(
      screen.queryByText('Hubo un error en el servidor')
    ).not.toBeInTheDocument()
  );
});

it('gets table values', async () => {
  renderWithRouter(<VisitsTable match={mock_router_path} />);
  await waitFor(() => expect(screen.getByText('Módulo 1')));
});

it('has a second view mode', async () => {
  renderWithRouter(<VisitsTable match={mock_router_path} />);
  await waitFor(() => expect(screen.getByText('Módulo 1')));
  userEvent.click(screen.getByLabelText('Agrupar Módulos'));
  await waitFor(() => expect(screen.getByText('1.1')));
});
