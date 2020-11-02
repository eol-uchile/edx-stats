import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { render, waitFor, screen } from '../../data/tests-utils';
import TableVertical from '../components/TableVertical';

it('renders without crashing', () => {
  render(
    <TableVertical
      title="foo"
      headers={{
        chapters: [{ name: 'bar', subtotal: 1 }],
        sequentials: [<th>'bar'</th>],
        verticals: [{ id: 0, val: 'bar', tooltip: 'bar' }],
      }}
      data={[]}
      errors={[]}
      captio={''}
    />
  );
  expect(screen.getByText('Estudiantes'));
  expect(screen.getByText('Mostrando 0 de 0'));
});

it('renders two pages', () => {
  render(
    <TableVertical
      title="foo"
      headers={{
        chapters: [{ name: 'bar', subtotal: 1 }],
        sequentials: [<th>'bar'</th>],
        verticals: [{ id: 0, val: 'bar', tooltip: 'bar' }],
      }}
      data={[
        ['foo student', 'foo data'],
        ['bar student', 'bar data'],
      ]}
      errors={[]}
      captio={''}
      defaultPage={1}
    />
  );
  expect(screen.getByText('Estudiantes'));
  expect(screen.getByText('Mostrando 1 de 2'));
  expect(screen.getByText('foo student'));
});

it('changes to next page', () => {
  render(
    <TableVertical
      title="foo"
      headers={{
        chapters: [{ name: 'bar', subtotal: 1 }],
        sequentials: [<th>'bar'</th>],
        verticals: [{ id: 0, val: 'bar', tooltip: 'bar' }],
      }}
      data={[
        ['foo student', 'foo data'],
        ['bar student', 'bar data'],
      ]}
      errors={[]}
      captio={''}
      defaultPage={1}
    />
  );
  userEvent.click(screen.getByText('Siguiente'));
  expect(screen.getByText('bar student'));
});
