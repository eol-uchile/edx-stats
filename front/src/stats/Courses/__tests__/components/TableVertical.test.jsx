import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../data/tests-utils';
import TableVertical from '../../common/StudentDetails_common/TableVertical';
import { classNameRuling } from '../../helpers';

const headers = {
  chapters: [{ name: 'bar', subtotal: 1 }],
  sequentials: [{ total_verticals: 1, name: 'name', val: '1.1' }],
  verticals: [{ id: 0, val: 'bar', tooltip: 'bar' }],
};

const data = [
  ['foo student', 0],
  ['bar student', 10],
];

const coloring = (d) => classNameRuling(d, 0, 3, 6);

it('renders without crashing', () => {
  render(
    <TableVertical
      title="foo"
      headers={headers}
      data={[]}
      errors={[]}
      caption={''}
    />
  );
  expect(screen.getByText('Estudiantes'));
  expect(screen.getByText('Mostrando 0 de 0'));
});

it('renders two pages', () => {
  render(
    <TableVertical
      title="foo"
      headers={headers}
      data={data}
      errors={[]}
      caption={''}
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
      headers={headers}
      data={data}
      errors={[]}
      caption={''}
      defaultPage={1}
    />
  );
  userEvent.click(screen.getByText('Siguiente'));
  expect(screen.getByText('bar student'));
});

it('colors students', () => {
  render(
    <TableVertical
      title="foo"
      headers={headers}
      data={data}
      errors={[]}
      caption={''}
      coloring={coloring}
    />
  );
  userEvent.click(screen.getByText('Siguiente'));
  expect(screen.getByText('bar student'));
  expect(screen.getByText('0').className).toEqual('data-table-coloring-zeros');
  expect(screen.getByText('10').className).toEqual('data-table-coloring-l2');
});
