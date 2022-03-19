import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '../../../data/tests-utils';
import StackedArea from '../../common/StackedArea';

const sample_data = [
  { y1: 1, y2: 2, val: 'val' },
  { y1: 2, y2: 2, val: 'val' },
];

it('renders without crashing', () => {
  render(
    <StackedArea
      data={sample_data}
      xKey="val"
      xLabel="x"
      yLabel="y"
      tooltip={{
        title: 'xKey: {}',
        body: {
          y1: { label: 'First area value: {}' },
          y2: { label: 'Second area value: {}' },
        },
      }}
    />
  );
  expect(screen.findByText('x'));
  expect(screen.findByText('y'));
});
