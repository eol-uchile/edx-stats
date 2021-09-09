import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '../../../data/tests-utils';
import StackedArea from '../../common/StackedArea';

const sample_data = [
  { bar1: 1, bar2: 2, val: 'val' },
  { bar1: 2, bar2: 2, val: 'val' },
];

it('renders without crashing', () => {
  render(
    <StackedArea
      data={sample_data}
      bar1_key="bar1"
      bar2_key="bar2"
      name_key="val"
      y_label="y"
    />
  );
  expect(screen.getByText('y'));
});
