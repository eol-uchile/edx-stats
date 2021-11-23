import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import StudentInfoModal from '../../common/StudentInfoModal';

const userData = {
  loaded: true,
  username: 'dummy',
  name: '',
  year_of_birth: '',
  gender: '',
  email: '',
  date_joined: '',
  country: '',
  last_update: ''
};

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}

  observe() {
    return null;
  }

  disconnect() {
    return null;
  };

  unobserve() {
    return null;
  }
};

it('renders correctly', () => {
  render(<StudentInfoModal isOpen doToggle={() => {}} data={userData} errors={[]}/>);
  expect(screen.getByText('dummy'));
});

it('shows error', () => {
  render(<StudentInfoModal isOpen doToggle={() => {}} data={userData} errors={["Error: El estudiante no ha sido ingresado al sistema, por favor intente más tarde."]}/>);
  expect(screen.getByText("Error: El estudiante no ha sido ingresado al sistema, por favor intente más tarde."));
});
