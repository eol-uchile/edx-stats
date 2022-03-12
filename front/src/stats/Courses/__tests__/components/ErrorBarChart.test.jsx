import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '../../../data/tests-utils';
import ErrorBarChart from '../../common/ErrorBarChart';

const sample_data = [
  { area: 1, errorX: 0, val: 'val', id: 'id', tooltip: 'tt' },
  { area: 2, errorX: 0, val: 'val', id: 'id', tooltip: 'tt' },
];

it('renders without crashing', () => {
  render(
    <ErrorBarChart
      data={sample_data}
      xKey="val"
      xLabel="x"
      yLabel="y"
      tooltip={{
        title: 'xKey: {} and tooltip:',
        body: {
          area: {
            label: 'area: {}',
          },
          errorX: {
            label: 'errorX: {}',
          },
        },
      }}
    />
  );
  expect(screen.findByText('x'));
  expect(screen.findByText('y'));
});
