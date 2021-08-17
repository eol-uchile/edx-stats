import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '../../../data/tests-utils';
import { server, rest, urls } from '../../../../tests/server';
import CoursesWrapper from '../../coursesWrapper';
import { CountBoxes } from '../components';

const flushPromises = () => new Promise(setImmediate);

const courseData = {
  allowed: true,
  lowerDate: '2019-01-01',
  upperDate: '2019-01-02',
};
const errors = [];
const setErrors = () => {};

it('renders no data message', async () => {
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
  render(
    <CoursesWrapper
      render={(props) => <CountBoxes {...{ courseData, errors, setErrors }} />}
    />
  );
  await flushPromises();
  waitFor(() =>
    expect(screen.getByText('No hay datos generales para resumir'))
  );
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

  render(
    <CoursesWrapper
      render={(props) => <CountBoxes {...{ courseData, errors, setErrors }} />}
    />
  );
  await flushPromises();
  waitFor(() => {
    expect(screen.getByText('1.481'));
    expect(screen.getByText('32'));
    expect(screen.getByText('8.878'));
  });
});
