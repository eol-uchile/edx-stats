import React, { useEffect, useCallback, Fragment, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Breadcrumb,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { connect, useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { Collapsible } from '@edx/paragon';
import { Link } from 'react-router-dom';
import { CountBoxes, ChartBoxes, Menu } from './components';
import PropTypes from 'prop-types';
import { useOverview } from './hooks';
import { useLoadCourseInfo } from '../hooks';
import { course as courseActions, actions } from '../../Courses/data/actions';
import { overviewActions } from '.';

const getToday = (d = 0) => {
  let date = new Date(Date.now() + d * 24 * 60 * 60 * 1000);
  return date;
};

const Overview = (props) => {
  const course = useSelector((state) => state.course);
  const dispatch = useDispatch();

  const generalStats = useSelector((state) => state.generalStats);

  const resetStats = useCallback(
    () => dispatch(overviewActions.resetGeneralStats()),
    []
  );

  const [state, setState, errors, setErrors, removeErrors] = useLoadCourseInfo(
    props.match,
    resetStats,
    generalStats.errors
  );

  const recoverCourseGeneralStats = useCallback((i, l, u) => {
    dispatch(overviewActions.recoverCourseGeneralTimes(i, l, u));
    dispatch(overviewActions.recoverCourseGeneralVisits(i, l, u));
    dispatch(
      overviewActions.recoverCourseDetailedTimes(i, getToday(-7), getToday())
    );
    dispatch(
      overviewActions.recoverCourseDetailedVisits(i, getToday(-7), getToday())
    );
  }, []);

  const [dataLoaded, setDataLoaded, countBox, chartBox] = useOverview(
    generalStats,
    recoverCourseGeneralStats,
    errors,
    setErrors,
    state.upperDate,
    state.lowerDate
  );

  // Load data when current course is matched
  useEffect(() => {
    if (state.current !== '') {
      if (!state.allowed) {
        setErrors([...errors, 'No tienes permisos para consultar estos datos']);
      } else {
        setDataLoaded(false);
        dispatch(courseActions.recoverCourseStructure(state.current));
        setErrors([]);
        dispatch(actions.cleanErrors());
      }
    }
  }, [state.current]);

  return (
    <Container className="rounded-lg shadow-lg py-4 px-5 my-2">
      <Helmet>
        <title>Analítica EOL</title>
      </Helmet>
      <Row>
        <Col>
          <Breadcrumb className="eol-breadcrumb">
            <Link className="breadcrumb-item" to={`/courses/`}>
              <FontAwesomeIcon icon={faHome} /> General
            </Link>
            <Breadcrumb.Item
              href="#"
              active
            >{`Resumen ${state.current}`}</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2 className="content-header">
            Curso:{' '}
            {state.allowed ? (
              state.courseName === '' ? (
                <Fragment>
                  {state.current}{' '}
                  <Spinner animation="border" variant="primary" />
                </Fragment>
              ) : (
                state.courseName
              )
            ) : (
              <Fragment>Sin información</Fragment>
            )}{' '}
          </h2>
        </Col>
      </Row>
      {course.status === 'loading' && !dataLoaded ? (
        <Row>
          <Col style={{ textAlign: 'center' }}>
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      ) : dataLoaded ? (
        <Fragment>
          <Row>
            <Col>
              {errors.length !== 0
                ? errors.map((e, k) => (
                    <Alert
                      variant="warning"
                      key={k}
                      dismissible
                      onClick={() => removeErrors(e)}
                    >
                      {e}
                    </Alert>
                  ))
                : null}
            </Col>
          </Row>

          {countBox.loaded &&
          countBox.values.times !== 0 &&
          countBox.values.visits !== 0 &&
          countBox.values.users !== 0 ? (
            <CountBoxes stats={countBox.values} />
          ) : errors.length === 0 && !countBox.loaded ? (
            <Row>
              <Col style={{ textAlign: 'left', marginLeft: '2rem' }}>
                <Spinner animation="border" variant="primary" />
              </Col>
            </Row>
          ) : (
            <Row>
              <Col>No hay datos</Col>
            </Row>
          )}
          {chartBox.loaded &&
          chartBox.values.week_times.length !== 0 &&
          chartBox.values.week_visits.length !== 0 &&
          chartBox.values.module_visits.length !== 0 &&
          chartBox.values.seq_visits.length !== 0 ? (
            <ChartBoxes data={chartBox.values} />
          ) : !chartBox.loaded ? (
            <Row>
              <Col style={{ textAlign: 'left', marginLeft: '2rem' }}>
                <Spinner animation="border" variant="primary" />
              </Col>
            </Row>
          ) : (
            <Row>
              <Col>No hay datos</Col>
            </Row>
          )}
          <Menu
            data={{
              key: state.current,
              start: state.lowerDate,
              end: state.upperDate,
            }}
          />
          <Row>
            <Col>
              <Collapsible styling="basic" title="Attribución de íconos">
                <div>
                  Íconos atribuidos a{' '}
                  <a href="https://www.freepik.com" title="Freepik">
                    Freepik
                  </a>{' '}
                  de{' '}
                  <a href="https://www.flaticon.com/" title="Flaticon">
                    www.flaticon.com
                  </a>
                </div>
                <div>
                  Íconos atribuidos a{' '}
                  <a href="" title="Kiranshastry">
                    Kiranshastry
                  </a>{' '}
                  de{' '}
                  <a href="https://www.flaticon.com/" title="Flaticon">
                    www.flaticon.com
                  </a>
                </div>
                <div>
                  Íconos atribuidos a{' '}
                  <a href="https://icon54.com/" title="Pixel perfect">
                    Pixel perfect
                  </a>{' '}
                  de{' '}
                  <a href="https://www.flaticon.com/" title="Flaticon">
                    www.flaticon.com
                  </a>
                </div>
              </Collapsible>
            </Col>
          </Row>
        </Fragment>
      ) : (
        <Row>
          <Col>
            {errors.length !== 0 &&
              errors.map((e, k) => (
                <Alert
                  variant="warning"
                  key={k}
                  dismissible
                  onClose={() => removeErrors(e)}
                >
                  {e}
                </Alert>
              ))}
          </Col>
        </Row>
      )}
    </Container>
  );
};

Overview.propTypes = {};

export default connect()(Overview);
