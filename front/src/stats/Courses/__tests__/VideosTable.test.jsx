import React from 'react';
import '@testing-library/jest-dom';
import { renderWithRouter, screen, waitFor } from '../../data/tests-utils';
import { server, rest, urls } from '../../../tests/server';
import CoursesWrapper from '../coursesWrapper';
import { VideosTable } from '../Videos';
import userEvent from '@testing-library/user-event';

const mock_router_path = {
  params: {
    course_id: 'course-v1:UChile+LEIT01+2020_T3',
  },
};

it('renders without crashing', () => {
  renderWithRouter(
    <CoursesWrapper
      render={(props) => <VideosTable match={mock_router_path} {...props} />}
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
      render={(props) => <VideosTable match={mock_router_path} {...props} />}
    />
  );
  await waitFor(() => expect(screen.getByText('Hubo un error en el servidor')));
});

it('displays no permissions message for not allowed courses', async () => {
  renderWithRouter(
    <CoursesWrapper
      render={(props) => (
        <VideosTable
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
      render={(props) => <VideosTable match={mock_router_path} {...props} />}
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
