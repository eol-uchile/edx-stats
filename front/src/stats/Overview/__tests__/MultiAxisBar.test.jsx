import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '../../data/tests-utils';
import MultiAxisBars from '../components/MultiAxisBars';

const sample_data = [
  { bar1: 1, bar2: 2, val: 'val', id: 'id', tooltip: 'tt' },
  { bar1: 2, bar2: 2, val: 'val', id: 'id', tooltip: 'tt' },
];

it('renders without crashing', () => {
  render(
    <MultiAxisBars
      data={sample_data}
      bar1_key="bar1"
      bar2_key="bar2"
      name_key="val"
      x_label="x"
      y1_label="y1"
      y2_label="y2"
      width={200}
    />
  );
  expect(screen.getByText('x'));
  expect(screen.getByText('y1'));
  expect(screen.getByText('y2'));
});
