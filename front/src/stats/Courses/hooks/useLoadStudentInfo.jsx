import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

function useLoadStudentInfo(recoverInfo) {
  const studentDetails = useSelector((state) => state.student);

  const [modal, setModal] = useState(false);
  const [user, setUser] = useState({
    loaded: false,
    username: '',
  });
  const [studentInfo, setStudentInfo] = useState({
    username: '',
    name: '',
    year_of_birth: '',
    gender: '',
    email: '',
    date_joined: '',
    country: '',
  });

  useEffect(() => {
    if (user.username !== '') {
      recoverInfo(user.username);
      setUser({ ...studentInfo, loaded: true });
    }
  }, [modal]);

  useEffect(() => {
    if (user.loaded && studentDetails.status === 'success') {
      setStudentInfo({ ...studentInfo, ...studentDetails.student_details });
    }
  }, [user.loaded, studentDetails.status]);

  return [modal, setModal, studentInfo, setUser];
}

export default useLoadStudentInfo;
