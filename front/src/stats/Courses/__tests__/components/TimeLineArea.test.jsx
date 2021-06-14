import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '../../../data/tests-utils';
import TimeLineArea from '../../common/TimeLineArea';

const sample_data = [
  { hash1: 1, hash2: 2, date: '2021-03-24' },
  { hash1: 2, hash2: 2, date: '2021-03-25' },
];

const keys = ['hash1', 'hash2'];

const mapping = {
  hash1: 'Modulo 1',
  hash2: 'Modulo 2',
};

it('renders without crashing', async () => {
  render(
    <TimeLineArea
      data={sample_data}
      keys={keys}
      mapping={mapping}
      height={700}
    />
  );
  // await waitFor(() => expect(screen.getByText('Visitas')));
  // expect(screen.getByText('Modulo 1'));
  // expect(screen.getByText('Modulo 2'));
});
