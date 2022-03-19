import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '../../../data/tests-utils';
import { server, rest, urls } from '../../../../tests/server';
import CoursesWrapper from '../../coursesWrapper';
import { ChartBoxes } from '../components';
import userEvent from '@testing-library/user-event';

const flushPromises = () => new Promise(setImmediate);

const courseInfo = {
  lowerDate: '2019-01-01',
  upperDate: '2019-01-02',
};

const loadedData = {
  week_times: [{ time: '2019-01-01', total: 1000 }],
  week_visits: [{ time: '2019-01-01', total: 24 }],
  module_visits: [
    {
      vertical__chapter: 'block-v1:UChile+LEIT01+2020_T3+type@chapter+block@4',
      name: 'Module 1',
      total: 1000,
    },
  ],
  seq_visits: [
    {
      vertical__sequential:
        'block-v1:UChile+LEIT01+2020_T3+type@sequential+block@4',
      name: 'Auxiliar Video',
      chap_number: 1,
      seq_number: 1,
      total: 1000,
    },
  ],
};

it('renders no data message', async () => {
  render(
    <CoursesWrapper
      render={(props) => <ChartBoxes courseInfo={courseInfo} />}
    />
  );
  await flushPromises();
  waitFor(() =>
    expect(screen.getByText('No hay datos para la fecha seleccionada'))
  );
});

it('renders correctly', async () => {
  server.use(
    rest.get(
      `${urls.base_url}/api/times/timeoncourse/overview/detailed/*`,
      async (req, res, ctx) => {
        return res(ctx.json({ total_time: loadedData.week_times }));
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
              date: loadedData.week_visits,
              module: loadedData.module_visits,
              seq: loadedData.seq_visits,
            },
          })
        );
      }
    )
  );

  render(
    <CoursesWrapper
      render={(props) => <ChartBoxes courseInfo={courseInfo} />}
    />
  );
  await flushPromises();
  waitFor(() => {
    userEvent.click(screen.getByTestId('chart-startDate'));
    expect(screen.getByText('Total durante la semana'));
    expect(screen.getByText('Contenido visitado durante la semana'));
  });
});

it('has a second view mode', async () => {
  server.use(
    rest.get(
      `${urls.base_url}/api/times/timeoncourse/overview/detailed/*`,
      async (req, res, ctx) => {
        return res(ctx.json({ total_time: loadedData.week_times }));
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
              date: loadedData.week_visits,
              module: loadedData.module_visits,
              seq: loadedData.seq_visits,
            },
          })
        );
      }
    )
  );
  render(
    <CoursesWrapper
      render={(props) => <ChartBoxes courseInfo={courseInfo} />}
    />
  );
  await flushPromises();
  waitFor(() => {
    expect(screen.getByText('1.1 : Auxiliar Video'));
    userEvent.click(screen.getByLabelText('Agrupar Secciones'));
    expect(screen.getByText('Module 1'));
  });
});
