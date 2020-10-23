import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '../data/tests-utils';
import RedirectToFeature from './RedirectToFeature';

it('renders without crashing', () => {
  render(<RedirectToFeature path="/" message="foo" />);
  expect(screen.getByText('Redirigiendo a foo ...')).toBeInTheDocument();
});
