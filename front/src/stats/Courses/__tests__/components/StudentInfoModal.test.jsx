import React from 'react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
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

it('renders correctly', () => {
  render(<StudentInfoModal isOpen doToggle={() => {}} data={userData} />);
  expect(screen.getByText('dummy'));
});
