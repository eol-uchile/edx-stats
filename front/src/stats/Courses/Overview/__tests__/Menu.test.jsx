import React from 'react';
import '@testing-library/jest-dom';
import {
  renderWithRouter,
  screen,
} from '../../../data/tests-utils';
import CoursesWrapper from '../../coursesWrapper';
import { Menu } from '../components';

const url = {
  key: 'course-v1:UChile+LEIT01+2020_T3',
  start: '2019-07-27T00:00:00Z',
  end: '2019-12-22T04:00:00Z',
};

it('renders correctly', () => {
  renderWithRouter(
    <CoursesWrapper render={(props) => <Menu url={url} {...props} />} />
  );
  expect(screen.getByText('Consultar Analítica'));
});
