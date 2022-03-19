import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '../../../data/tests-utils';
import LineArea from '../../common/LineArea';

const sample_data = [
  { x: 'A', y1: 10, y2: 20 },
  { x: 'B', y1: 10, y2: 20 },
  { x: 'C', y1: 10, y2: 20 },
  { x: 'D', y1: 10, y2: 20 },
  { x: 'E', y1: 10, y2: 20 },
  { x: 'F', y1: 10, y2: 20 },
  { x: 'G', y1: 10, y2: 20 },
];

it('renders without crashing', () => {
  render(
    <LineArea
      data={sample_data}
      xKey="x"
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
