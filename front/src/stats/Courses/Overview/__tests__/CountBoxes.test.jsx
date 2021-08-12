import React from 'react';
import '@testing-library/jest-dom';
import { renderWithRouter, screen } from '../../../data/tests-utils';
import CoursesWrapper from '../../coursesWrapper';
import { CountBoxes } from '../components';

const defaultStats = {
  visits: 0,
  users: 0,
  times: 0,
};

it('renders without crashing', () => {
  renderWithRouter(
    <CoursesWrapper render={(props) => <CountBoxes stats={defaultStats} />} />
  );
  expect(screen.getByText('Visitas totales'));
  expect(screen.getByText('Usuarios registrados'));
  expect(screen.getByText('Minutos vistos'));
  expect(screen.getAllByText('0')).toHaveLength(3);
});
