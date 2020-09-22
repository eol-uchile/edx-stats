import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '../../data/tests-utils';
import Landing from '../Landing';
// Mock calls to the Edx modules
import * as frontenAuth from '@edx/frontend-platform/auth';
jest.mock('@edx/frontend-platform/auth');

beforeEach(() => {
  jest.clearAllMocks();
});

it('renders without crashing', () => {
  jest
    .spyOn(frontenAuth, 'getAuthenticatedHttpClient')
    .mockReturnValue({ get: jest.fn(() => Promise.resolve({ data: {} })) });
  render(<Landing />);
  expect(screen.queryByTestId('AvailableCoursesCollapse')).toHaveTextContent(
    'Cursos disponibles'
  );
});
