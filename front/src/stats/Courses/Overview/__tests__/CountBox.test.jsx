import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '../../../data/tests-utils';
import { CountBox } from '../components';
import eyeIcon from '../../assets/eye(1)_original.png';

const countUp = {
  start: 1000,
  end: 10000,
  duration: 2.75,
  separator: '.',
  decimals: 0,
  decimal: ',',
};

it('renders without crashing', () => {
  render(
    <CountBox image={eyeIcon} caption={'caption text'} countUpProps={countUp} />
  );
  expect(screen.getByText('caption text'));
  expect(screen.getByText('1.000'));
});
