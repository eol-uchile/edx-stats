import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '../../../data/tests-utils';
import StackedBar from '../../common/StackedBar';

const sample_data = [
  { bar1: 1, bar2: 2, val: 'val' },
  { bar1: 2, bar2: 2, val: 'val' },
];

it('renders without crashing', () => {
  render(
    <StackedBar
      data={sample_data}
      bar1_key="bar1"
      bar2_key="bar2"
      name_key="val"
      x_label="x"
      y_label="y"
    />
  );
  expect(screen.getByText('x'));
  expect(screen.getByText('y'));
});
