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
import { Steps } from 'intro.js-react';

const steps = [
  {
    element: '.h2',
    title: 'Resumen del curso',
    intro: 'Aquí podrá ver las estadisticas de su curso.',
  },
  {
    element: '.countboxes',
    title: 'Estadísticas generales',
    intro: `En esta sección se cargarán las estadísticas generales, 
      es decir, cuál es el registro de la totalidad del curso a la fecha.`,
  },
  {
    element: '.chartboxes',
    title: 'Estadísticas semanales',
    intro: `En esta sección se cargarán las estadísticas semanales, 
      gráficando las visitas diarias al curso junto a su duración 
      y cuál fue el contenido más visto de la semana indicada.`,
  },
  {
    element: '.chartboxes .btn-group',
    title: 'Estadísticas semanales',
    intro: `Si quiere ver las estadísticas de semanas anteriores, 
      puede hacerlo moviéndose con los botones o seleccionando
      la fecha del último día a buscar.`,
  },
  {
    element: '.analitica-menu',
    title: 'Estadísticas particulares',
    intro: `Si desea ver estadísticas más detalladas, asi como descargarlas
      en una planilla, puede hacerlo visitando los siguientes enlaces.`,
  },
];

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
    if (state.current !== '') {
      if (!state.allowed) {
        setErrors([...errors, 'No tienes permisos para consultar estos datos']);
      } else {
        //setDataLoaded(false);
        dispatch(courseActions.recoverCourseStructure(state.current));
        setErrors([]);
        dispatch(actions.cleanErrors());
      }
    }
  }, [state.current]);

  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('tutorial-overview') === null) {
      setShowTutorial(true);
      localStorage.setItem('tutorial-overview', 'seen');
    }
  }, []);

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
          {state.allowed && course.status === 'success' && (
            <span
              title="Abrir tutorial"
              className={'float-right'}
              onClick={() => setShowTutorial(true)}
            >
              <FontAwesomeIcon icon={faQuestionCircle} />
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
      {course.status === 'loading' ? (
        <Row>
          <Col style={{ textAlign: 'center' }}>
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      ) : state.allowed ? (
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
          <Steps
            enabled={showTutorial}
            steps={steps}
            initialStep={0}
            onExit={() => {
              setShowTutorial(!showTutorial);
            }}
            options={{
              showBullets: false,
              showProgress: true,
              prevLabel: 'Atrás',
              nextLabel: 'Siguiente',
              doneLabel: 'Finalizar',
              keyboardNavigation: true,
            }}
          />
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
