import React, { useEffect, useCallback, Fragment, useState } from 'react';
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
import { useLoadCourseInfo } from '../hooks';
import { course as courseActions, actions } from '../../Courses/data/actions';
import { overviewActions } from '.';
import { overviewTutorial as steps } from '../data/tutorials';

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

  useEffect(() => {
    if (
      state.current !== '' &&
      state.lowerDate !== '' &&
      state.upperDate !== '' &&
      state.allowed
    ) {
      dispatch(courseActions.recoverCourseStructure(state.current));
      setErrors([]);
      dispatch(actions.cleanErrors());
    }
  }, [state.current, state.lowerDate, state.upperDate, state.allowed]);

  const showTutorial = () => {
    introJs()
      .setOptions({
        steps: steps,
        showBullets: false,
        showProgress: true,
        prevLabel: 'Atrás',
        nextLabel: 'Siguiente',
        doneLabel: 'Finalizar',
        keyboardNavigation: true,
      })
      .start()
      .onexit(() => window.scrollTo({ behavior: 'smooth', top: 0 }));
  };
  useEffect(() => {
    if (
      course.course_status === 'success' &&
      localStorage.getItem('tutorial-overview') === null
    ) {
      showTutorial();
      localStorage.setItem('tutorial-overview', 'seen');
    }
  }, [course.course_status]);

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
          <CountBoxes
            courseData={state}
            errors={errors}
            setErrors={setErrors}
          />
          <ChartBoxes
            courseData={state}
            errors={errors}
            setErrors={setErrors}
          />
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
