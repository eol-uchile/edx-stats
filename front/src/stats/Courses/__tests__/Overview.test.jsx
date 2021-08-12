import React from 'react';
import '@testing-library/jest-dom';
import {
  render,
  renderWithRouter,
  screen,
  waitFor,
} from '../../data/tests-utils';
import { server, rest, urls } from '../../../tests/server';
import CoursesWrapper from '../coursesWrapper';
import { Overview } from '../Overview';
import userEvent from '@testing-library/user-event';

const flushPromises = () => new Promise(setImmediate);

const mock_router_path = {
  params: {
    course_id: 'course-v1:UChile+LEIT01+2020_T3',
  },
};

it('renders without crashing', () => {
  renderWithRouter(
    <CoursesWrapper
      render={(props) => <Overview match={mock_router_path} {...props} />}
    />
  );
  expect(screen.getByText('Curso: course-v1:UChile+LEIT01+2020_T3'));
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
  renderWithRouter(
    <CoursesWrapper
      render={(props) => <Overview match={mock_router_path} {...props} />}
    />
  );
  await waitFor(() => expect(screen.getByText('Hubo un error en el servidor')));
});

it('displays no permissions message for not allowed courses', async () => {
  renderWithRouter(
    <CoursesWrapper
      render={(props) => (
        <Overview
          match={{
            params: {
              course_id: 'course_foo',
            },
          }}
          {...props}
        />
      )}
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

  renderWithRouter(
    <CoursesWrapper
      render={(props) => <Overview match={mock_router_path} {...props} />}
    />
  );
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

it('displays no data message', async () => {
  server.use(
    rest.get(
      `${urls.base_url}/api/times/timeoncourse/overview/*`,
      async (req, res, ctx) => {
        return res(ctx.json({ total_time: 0 }));
      }
    )
  );
  server.use(
    rest.get(
      `${urls.base_url}/api/visits/visitsoncourse/overview/*`,
      async (req, res, ctx) => {
        return res(
          ctx.json({
            total_visits: 0,
            total_users: 0,
          })
        );
      }
    )
  );
  server.use(
    rest.get(
      `${urls.base_url}/api/times/timeoncourse/overview/detailed/*`,
      async (req, res, ctx) => {
        return res(ctx.json({ total_time: [] }));
      }
    )
  );
  server.use(
    rest.get(
      `${urls.base_url}/api/visits/visitsoncourse/overview/detailed/*`,
      async (req, res, ctx) => {
        return res(
          ctx.json({
            total_visits: { date: [], module: [], seq: [] },
          })
        );
      }
    )
  );

  renderWithRouter(
    <CoursesWrapper
      render={(props) => <Overview match={mock_router_path} {...props} />}
    />
  );

  await flushPromises();
  waitFor(() => {
    expect(screen.getByText('No hay datos generales para resumir'));
    expect(screen.getByText('No hay datos semanales para graficar'));
  });
});

it('renders correctly', async () => {
  server.use(
    rest.get(
      `${urls.base_url}/api/times/timeoncourse/overview/*`,
      async (req, res, ctx) => {
        return res(ctx.json({ total_time: 532717 }));
      }
    )
  );
  server.use(
    rest.get(
      `${urls.base_url}/api/visits/visitsoncourse/overview/*`,
      async (req, res, ctx) => {
        return res(
          ctx.json({
            total_visits: 1481,
            total_users: 32,
          })
        );
      }
    )
  );
  server.use(
    rest.get(
      `${urls.base_url}/api/times/timeoncourse/overview/detailed/*`,
      async (req, res, ctx) => {
        return res(
          ctx.json({ total_time: [{ time: '2019-01-01', total: 1000 }] })
        );
      }
    )
  );
  server.use(
    rest.get(
      `${urls.base_url}/api/visits/visitsoncourse/overview/detailed/*`,
      async (req, res, ctx) => {
        return res(
          ctx.json({
            total_visits: {
              date: [{ time: '2019-01-01', total: 24 }],
              module: [
                {
                  vertical__chapter:
                    'block-v1:UChile+LEIT01+2020_T3+type@chapter+block@4',
                  name: 'Module 1',
                  total: 1000,
                },
              ],
              seq: [
                {
                  vertical__sequential:
                    'block-v1:UChile+LEIT01+2020_T3+type@sequential+block@4',
                  name: 'Auxiliar Video',
                  chap_number: 1,
                  seq_number: 1,
                  total: 1000,
                },
              ],
            },
          })
        );
      }
    )
  );

  renderWithRouter(
    <CoursesWrapper
      render={(props) => <Overview match={mock_router_path} {...props} />}
    />
  );

  await flushPromises();
  waitFor(() => {
    expect(screen.getByText('1.481'));
    expect(screen.getByText('32'));
    expect(screen.getByText('8.878'));
    expect(screen.getByText('Actividad durante la semana'));
    expect(screen.getByText('Contenido visitado durante la semana'));
    expect(screen.getByLabelText('Agrupar Módulos'));
  });
});
