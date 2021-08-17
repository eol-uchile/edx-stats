import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
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
  }, []);

  const [dataLoaded, setDataLoaded, countBox] = useCountBoxes(
    generalStats,
    recoverCourseGeneralStats,
    errors,
    setErrors,
    courseData.allowed,
    courseData.upperDate,
    courseData.lowerDate
  );

  return (
    <Container className="countboxes">
      {dataLoaded &&
      countBox.visits !== 0 &&
      countBox.users !== 0 &&
      countBox.times !== 0 ? (
        <Row>
          <Col md={4} className="visits">
            <CountBox
              image={eyeIcon}
              change={20}
              caption={'Visitas totales'}
              countUpProps={{
                start: 0,
                end: countBox.visits,
                duration: 2.75,
                separator: '.',
                decimals: 0,
                decimal: ',',
              }}
            />
          </Col>
          <Col md={4} className="users">
            <CountBox
              image={userIcon}
              change={20}
              caption={'Usuarios registrados'}
              countUpProps={{
                start: 0,
                end: countBox.users,
                duration: 2.75,
                separator: '.',
                decimals: 0,
                decimal: ',',
              }}
            />
          </Col>
          <Col md={4} className="times">
            <CountBox
              image={clockIcon}
              change={20}
              caption={'Minutos vistos'}
              countUpProps={{
                start: 0,
                end: countBox.times,
                duration: 2.75,
                separator: '.',
                decimals: 0,
                decimal: ',',
              }}
            />
          </Col>
        </Row>
      ) : errors.length === 0 && !dataLoaded ? (
        <Row>
          <Col style={{ textAlign: 'left', marginLeft: '2rem' }}>
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      ) : (
        <Row>
          <Col>No hay datos generales para resumir</Col>
        </Row>
      )}
    </Container>
  );
};

CountBoxes.propTypes = {
  courseData: 
    PropTypes.shape({
      allowed: PropTypes.bool.isRequired,
      courseName: PropTypes.string,
      current: PropTypes.string,
      lowerDate: PropTypes.string.isRequired,
      upperDate: PropTypes.string.isRequired,
    }
  ).isRequired,
  errors: PropTypes.array.isRequired,
  setErrors: PropTypes.func.isRequired,
};

export default CountBoxes;
