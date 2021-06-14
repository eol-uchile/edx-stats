import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ExportCsv from '../../common/ExportCsv';

it('renders correctly', () => {
  render(<ExportCsv text="test" />);
  expect(screen.queryByTestId('csvLink')).toHaveTextContent('test');
});
