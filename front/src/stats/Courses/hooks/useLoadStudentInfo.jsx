import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

function useLoadStudentInfo(recoverInfo, resetData) {
  const course = useSelector((state) => state.course);
  const studentDetails = useSelector((state) => state.student);

  const [modal, setModal] = useState(false);

  const [user, setUser] = useState({
    loaded: false,
    username: '',
  });

  const [studentInfo, setStudentInfo] = useState({
    loaded: false,
    username: '',
    name: '',
    year_of_birth: '',
    gender: '',
    email: '',
    date_joined: '',
    country: '',
    last_update: ''
  });

  const [errors, setErrors] = useState([]);

  // Add clean up functions
  useEffect(() => {
    if (!modal) {
      resetData();
      setUser({ username: '', loaded: false });
      setStudentInfo({
        username: '',
        name: '',
        year_of_birth: '',
        gender: '',
        email: '',
        date_joined: '',
        country: '',
        last_update: '',
        loaded: false,
      });
      setErrors([]);
    }
  }, [modal]);

  useEffect(() => {
    if (course.course.length !== 0 && user.username !== '') {
      let current = course.course[0];
      recoverInfo(current.id, user.username);
      setUser({ ...studentInfo, loaded: true });
    }
    // eslint-disable-next-line
  }, [course.course, modal]);

  useEffect(() => {
    if (user.loaded && studentDetails.status === 'success') {
      setStudentInfo({
        ...studentInfo,
        ...studentDetails.student_details,
        loaded: true,
      });
    }
  }, [user.loaded, studentDetails.status]);

  useEffect(() => {
    if (studentDetails.errors.length > 0) {
      setErrors([...errors, ...studentDetails.errors]);
      setStudentInfo({
        username: '',
        name: '',
        year_of_birth: '',
        gender: '',
        email: '',
        date_joined: '',
        country: '',
        last_update: '',
        loaded: true,
      });
    }
  }, [studentDetails.errors]);

  return [modal, setModal, studentInfo, errors, setUser];
}

export default useLoadStudentInfo;
