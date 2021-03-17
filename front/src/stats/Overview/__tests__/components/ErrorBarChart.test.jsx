import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '../../../data/tests-utils';
import ErrorBarChart from '../../components/ErrorBarChart';

const sample_data = [
  { area: 1, errorX: 0, val: 'val', id: 'id', tooltip: 'tt' },
  { area: 2, errorX: 0, val: 'val', id: 'id', tooltip: 'tt' },
];

it('renders without crashing', () => {
  render(
    <ErrorBarChart
      data={sample_data}
      area_key="area"
      name_key="val"
      x_label="x"
      y_label="y"
      width={200}
    />
  );
  expect(screen.getByText('x'));
  expect(screen.getByText('y'));
});
