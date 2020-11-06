import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../data/tests-utils';
import TableChapter from '../components/TableChapter';

it('renders without crashing', () => {
  render(
    <TableChapter
      title="foo"
      headers={{ chapters: [{ name: 'bar', subtotal: 1 }] }}
      data={[]}
      errors={[]}
      caption={''}
    />
  );
  expect(screen.getByText('Estudiantes')).toBeInTheDocument();
  expect(screen.getByText('Mostrando 0 de 0')).toBeInTheDocument();
});

it('renders two pages', () => {
  render(
    <TableChapter
      title="foo"
      headers={{ chapters: [{ name: 'bar', subtotal: 1 }] }}
      data={[
        ['foo student', 'foo data'],
        ['bar student', 'bar data'],
      ]}
      errors={[]}
      caption={''}
      defaultPage={1}
    />
  );
  expect(screen.getByText('Estudiantes')).toBeInTheDocument();
  expect(screen.getByText('Mostrando 1 de 2')).toBeInTheDocument();
  expect(screen.getByText('foo student')).toBeInTheDocument();
});

it('changes to next page', () => {
  render(
    <TableChapter
      title="foo"
      headers={{ chapters: [{ name: 'bar', subtotal: 1 }] }}
      data={[
        ['foo student', 'foo data'],
        ['bar student', 'bar data'],
      ]}
      errors={[]}
      caption={''}
      defaultPage={1}
    />
  );
  userEvent.click(screen.getByText('Siguiente'));
  expect(screen.getByText('bar student')).toBeInTheDocument();
});
