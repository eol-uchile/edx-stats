import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

function useLoadStudentInfo(recoverInfo) {
  //const studentDetails = useSelector((state) => state.student);

  const [modal, setModal] = useState(false);
  const [studentInfo, setStudentInfo] = useState({
    loaded: false,
    username: '',
  });

  useEffect(() => {
    if (studentInfo.username !== '') {
      //recoverInfo(studentInfo.username);
      setStudentInfo({ ...studentInfo, loaded: true });
    }
  }, [modal]);

  // useEffect(() => {
  //   if (studentInfo.loaded && studentDetails.status === 'success') {
  //     setStudentInfo({ ...studentInfo, ...studentDetails.student_details});
  //   }
  // }, [studentInfo, studentDetails]);

  return [modal, setModal, studentInfo, setStudentInfo];
}

export default useLoadStudentInfo;
