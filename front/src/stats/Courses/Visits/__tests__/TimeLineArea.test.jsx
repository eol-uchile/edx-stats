import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '../../../data/tests-utils';
import TimeLineArea from '../components/TimeLineArea';

const sample_data = [
  { hash1: 1, hash2: 2, date: '2021-03-24' },
  { hash1: 2, hash2: 2, date: '2021-03-25' },
];

const mapping = {
  hash1: { label: 'First area value: {}' },
  hash2: { label: 'Second area value: {}' },
};

it('renders without crashing', async () => {
  render(
    <TimeLineArea
      data={sample_data}
      xKey="date"
      xLabel="x"
      yLabel="y"
      tooltip={{
        title: 'xKey: {}',
        body: mapping,
      }}
    />
  );
  expect(screen.findByText('x'));
  expect(screen.findByText('y'));
});
