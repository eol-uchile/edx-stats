import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '../../../data/tests-utils';
import MultiAxisBars from '../../common/MultiAxisBars';

const sample_data = [
  { bar1: 1, bar2: 2, val: 'val', id: 'id', tooltip: 'tt' },
  { bar1: 2, bar2: 2, val: 'val', id: 'id', tooltip: 'tt' },
];

it('renders without crashing', () => {
  render(
    <MultiAxisBars
      data={sample_data}
      xKey="val"
      xLabel="x"
      yLabel="y"
      tooltip={{
        title: 'xKey: {} and tooltip:',
        body: {
          bar1: { label: 'First bar value: {}' },
          bae1: { label: 'Second bar value: {}' },
        },
      }}
    />
  );
  expect(screen.getByText('x'));
  expect(screen.getByText('y'));
});
