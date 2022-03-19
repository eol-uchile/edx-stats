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
/**
 * CountBoxes
 *
 * Display three boxes with general stadistics
 * (total visits, total users, total time).
 * Each box is independent.
 * @param {*} props
 * @returns
 */
const CountBoxes = ({ courseInfo }) => {
  const generalStats = useSelector((state) => state.generalStats);
  const dispatch = useDispatch();

  const recoverCourseGeneralStats = useCallback((i, l, u) => {
    dispatch(overviewActions.recoverCourseGeneralTimes(i, l, u));
    dispatch(overviewActions.recoverCourseGeneralVisits(i, l, u));
    dispatch(overviewActions.recoverCourseGeneralUsers(i, l, u));
  }, []);

  const [visits, users, times] = useCountBoxes(
    generalStats,
    recoverCourseGeneralStats,
    courseInfo.upperDate,
    courseInfo.lowerDate
  );

  return (
    <Container id="countboxes">
      <Row>
        <Col md={4}>
          <CountBox
            image={eyeIcon}
            caption={'Visitas totales'}
            countUpProps={{
              start: 0,
              end: visits.value,
              duration: 2.75,
              separator: '.',
              decimals: 0,
              decimal: ',',
            }}
            isLoading={!visits.loaded}
          />
        </Col>
        <Col md={4}>
          <CountBox
            image={userIcon}
            caption={'Usuarios registrados'}
            countUpProps={{
              start: 0,
              end: users.value,
              duration: 2.75,
              separator: '.',
              decimals: 0,
              decimal: ',',
            }}
            isLoading={!users.loaded}
          />
        </Col>
        <Col md={4}>
          <CountBox
            image={clockIcon}
            caption={'Minutos vistos'}
            countUpProps={{
              start: 0,
              end: times.value,
              duration: 2.75,
              separator: '.',
              decimals: 0,
              decimal: ',',
            }}
            isLoading={!times.loaded}
          />
        </Col>
      </Row>
    </Container>
  );
};

CountBoxes.propTypes = {
  courseInfo: PropTypes.shape({
    allowed: PropTypes.bool,
    courseName: PropTypes.string,
    current: PropTypes.string,
    lowerDate: PropTypes.string.isRequired,
    upperDate: PropTypes.string.isRequired,
  }).isRequired,
};

export default CountBoxes;
