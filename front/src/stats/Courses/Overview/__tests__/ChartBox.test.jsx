import React, { Fragment } from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '../../../data/tests-utils';
import { ChartBox } from '../components';

const reactChildren = (
  <Fragment>
    <p>Content</p>
  </Fragment>
);

it('renders without crashing', () => {
  render(<ChartBox title={'title text'} children={reactChildren} />);
  expect(screen.getByText('title text'));
  expect(screen.getByText('Content'));
});
