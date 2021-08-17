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

const dataKeys = ['x', 'y values'];

const areaProps = [
  {
    type: 'monotone',
    dataKey: 'y1',
    stroke: '#8884d8',
    fill: '#8884d89e',
    activeDot: { r: 8 },
  },
  {
    type: 'monotone',
    dataKey: 'y2',
    stroke: '#82ca9d',
    fill: '#82ca9da3',
    activeDot: { r: 8 },
  },
];

it('renders without crashing', () => {
  render(
    <LineArea data={sample_data} dataKey={dataKeys} areaProps={areaProps} />
  );
  expect(screen.findByText('y1'));
  expect(screen.findByText('y2'));
});
