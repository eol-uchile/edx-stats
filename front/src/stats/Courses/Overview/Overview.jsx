import React, { useCallback, Fragment, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Breadcrumb,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Collapsible } from '@edx/paragon';
import { Link } from 'react-router-dom';
import { CountBoxes, ChartBoxes, Menu } from './components';
import PropTypes from 'prop-types';
import { useLoadCourseInfo, useLoadStructure, useShowTutorial } from '../hooks';
import { overviewActions } from '.';
import { overviewTutorial as steps } from '../data/tutorials';
/**
 * Overview
 *
 * Display three boxes for general stadistics, two charts for weekly stadistics,
 * and a menu for detailed stadistics.
 * Handle errors from course info, course structure and data states.
 * The course can be provided by the URL.
 * @param {Object} props
 * @returns
 */
const Overview = (props) => {
  const course = useSelector((state) => state.course);
  const dispatch = useDispatch();

  const generalStats = useSelector((state) => state.generalStats);

  const resetStats = useCallback(
    () => dispatch(overviewActions.resetGeneralStats()),
    []
  );

  const statsErrors = useMemo(
    () => generalStats.general_errors.concat(generalStats.detailed_errors),
    [generalStats.general_errors, generalStats.detailed_errors]
  );

  const [state, setState, errors, setErrors, removeErrors] = useLoadCourseInfo(
    props.match,
    resetStats,
    statsErrors
  );

  const courseStructure = useLoadStructure(state, setErrors);

  const showTutorial = useShowTutorial(
    steps,
    course.course_status === 'success',
    'tutorial-overview'
  );

  return (
    <Container className="rounded-lg shadow-lg py-4 px-5 my-2">
      <Helmet>
        <title>Analítica EOL</title>
      </Helmet>
      <Row>
        <Col>
          <Breadcrumb className="eol-breadcrumb">
            <Link className="breadcrumb-item" to={`/search/`}>
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
          {course.course_status === 'success' && (
            <span
              title="Abrir tutorial"
              className={'float-right'}
              onClick={() => showTutorial()}
            >
              Ayuda <FontAwesomeIcon icon={faQuestionCircle} />
            </span>
          )}
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
      {course.course_status === 'loading' ? (
        <Row>
          <Col style={{ textAlign: 'center' }}>
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      ) : course.course_status === 'success' ? (
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
          <CountBoxes courseInfo={state} />
          <ChartBoxes courseInfo={state} />
          <Menu
            url={{
              key: state.current,
              start: state.lowerDate,
              end: state.upperDate,
            }}
          />
          <Row>
            <Col>
              <Collapsible styling="basic" title="Atribución de íconos">
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

Overview.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default Overview;
