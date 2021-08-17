import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '../../../data/tests-utils';
import PieChart from '../../common/PieChart';

const sample_data = [
  { name: 'content 1', value: 2 },
  { name: 'content 2', value: 2 },
];

it('renders without crashing', () => {
  render(<PieChart data={sample_data} />);
  expect(screen.findByText('content 1'));
  expect(screen.findByText('content 2'));
  expect(screen.findByText('50%'));
});
