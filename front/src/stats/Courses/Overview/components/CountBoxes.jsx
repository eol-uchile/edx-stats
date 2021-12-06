import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import userIcon from '../../assets/user_original.png';
import clockIcon from '../../assets/clock_original.png';
import eyeIcon from '../../assets/eye(1)_original.png';
import { CountBox } from '.';
import { useCountBoxes } from '../hooks';
import { overviewActions } from '../';
import PropTypes from 'prop-types';

const CountBoxes = ({ courseData, errors, setErrors }) => {
  const generalStats = useSelector((state) => state.generalStats);
  const dispatch = useDispatch();

  const recoverCourseGeneralStats = useCallback((i, l, u) => {
    dispatch(overviewActions.recoverCourseGeneralTimes(i, l, u));
    dispatch(overviewActions.recoverCourseGeneralVisits(i, l, u));
    dispatch(overviewActions.recoverCourseGeneralUsers(i, l, u));
  }, []);

  const [dataLoaded, setDataLoaded, countBox] = useCountBoxes(
    generalStats,
    recoverCourseGeneralStats,
    errors,
    setErrors,
    courseData.upperDate,
    courseData.lowerDate
  );

  return (
    <Container id="countboxes">
      <Row>
        <Col md={4}>
          <CountBox
            image={eyeIcon}
            change={20}
            caption={'Visitas totales'}
            countUpProps={{
              start: 0,
              end: countBox.visits.value,
              duration: 2.75,
              separator: '.',
              decimals: 0,
              decimal: ',',
            }}
            isLoading={!countBox.visits.loaded}
          />
        </Col>
        <Col md={4}>
          <CountBox
            image={userIcon}
            change={20}
            caption={'Usuarios registrados'}
            countUpProps={{
              start: 0,
              end: countBox.users.value,
              duration: 2.75,
              separator: '.',
              decimals: 0,
              decimal: ',',
            }}
            isLoading={!countBox.users.loaded}
          />
        </Col>
        <Col md={4}>
          <CountBox
            image={clockIcon}
            change={20}
            caption={'Minutos vistos'}
            countUpProps={{
              start: 0,
              end: countBox.times.value,
              duration: 2.75,
              separator: '.',
              decimals: 0,
              decimal: ',',
            }}
            isLoading={!countBox.times.loaded}
          />
        </Col>
      </Row>
    </Container>
  );
};

CountBoxes.propTypes = {
  courseData: PropTypes.shape({
    allowed: PropTypes.bool,
    courseName: PropTypes.string,
    current: PropTypes.string,
    lowerDate: PropTypes.string.isRequired,
    upperDate: PropTypes.string.isRequired,
  }).isRequired,
  errors: PropTypes.array.isRequired,
  setErrors: PropTypes.func.isRequired,
};

export default CountBoxes;
