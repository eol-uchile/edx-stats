import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import StudentDetails from '../../components/StudentDetails';

const tableData = {
  all: 2,
  chapters: [{ name: 'bar', subtotal: 1 }],
  sequentials: [{ id: 0, val: '1.1', tooltip: 'bar' }],
  verticals: [{ id: 0, val: '1.1.1', tooltip: 'bar' }],
};

const rowData = {
  all: [
    ['foo student', '0'],
    ['bar student', '10'],
  ],
  chapters: [
    ['foo student', '0'],
    ['bar student', '10'],
  ],
};

it('renders correctly', () => {
  render(<StudentDetails tableData={tableData} rowData={rowData} />);
  expect(screen.getByText('Detalle por estudiante'));
});

it('renders chapters by default', () => {
  render(<StudentDetails tableData={tableData} rowData={rowData} />);
  expect(screen.getByText('Estudiantes'));
  expect(screen.getByTestId('group-modules').checked).toEqual(true);
});

it('renders changes to verticals', () => {
  render(<StudentDetails tableData={tableData} rowData={rowData} />);
  expect(screen.getByTestId('group-modules').checked).toEqual(true);
  expect(screen.queryByText('1.1.1')).not.toBeInTheDocument();
  userEvent.click(screen.getByTestId('group-modules'));
  expect(screen.getByTestId('group-modules').checked).toEqual(false);
  expect(screen.getByText('1.1.1'));
});

it('filters students', () => {
  render(<StudentDetails tableData={tableData} rowData={rowData} />);
  userEvent.click(screen.getByTestId('group-modules'));
  expect(screen.getByText('1.1.1'));
  userEvent.type(screen.getByRole('searchbox'), 'foo{enter}');
  expect(screen.queryByText('bar student')).not.toBeInTheDocument();
});

it('does not die with default sorting function', () => {
  render(<StudentDetails tableData={tableData} rowData={rowData} />);
  userEvent.click(screen.getByText('bar')); // Click bar header
  // Change to verticals
  userEvent.click(screen.getByTestId('group-modules'));
  userEvent.click(screen.getByText('1.1.1')); // click vertical
});
