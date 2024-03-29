import React, { useEffect, useCallback, useState, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Row, Col, Breadcrumb, InputGroup, Container } from 'react-bootstrap';
import { Button, Input, Spinner, Alert } from '@edx/paragon';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { course as courseActions, actions } from '../data/actions';
import { visitActions } from '.';
import { StudentDetails } from '../common';
import { VisitTotals, DateBrowser } from './components';
import { useProcessDailyData } from './hooks';
import { useProcessSumData, useLoadCourseInfo } from '../hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faSearch,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import '../common/TableandChart.css';

const steps = [
  {
    title: 'Visitas por contenido',
    intro:
      'Aquí podrá ver lo que los usuarios visitan con más regularidad en su curso.',
  },
  {
    element: '.date-table-selectors',
    title: 'Visitas por contenido',
    intro: `Si quiere ver las estadísticas agrupadas de otro periodo de tiempo
    seleccione las fechas deseadas y luego cárguelas con el botón Explorar.`,
  },
  {
    element: '#VisitasTotales',
    title: 'Visitas totales',
    intro: `En esta sección se cargarán las visitas de cada sección, 
    acompañado de la cantidad de estudiantes que
    vieron el contenido.`,
  },
  {
    element: '#VisitasTotales .pgn__form-group',
    intro: `Puede seleccionar la vista desagrupada
    para una vista más particular de cada unidad.`,
  },
  {
    element: '#VisitasTotales a',
    intro: `También puede descargar esta información en una planilla de cálculos.`,
  },
  {
    element: '#date-browser',
    title: 'Visitas diarias',
    intro: `En esta sección se cargará la cantidad de visitas diarias de cada sección.
    Puede seleccionar distintos periodos de visualización.
    También puede descargar esta información en una planilla de cálculos
    usando el botón.`,
  },
  {
    element: '#DetallesPorEstudiante',
    title: 'Detalle por estudiante',
    intro: `En esta sección se cargará una tabla con las visitas de cada usuario 
    registrado en el curso. Puede seleccionar la vista desagrupada para datos más
    particulares. También puede descargar esta información en una planilla de cálculos
    usando el botón.`,
  },
  {
    element: '#DetallesPorEstudiante nav',
    title: 'Detalle por estudiante',
    intro: `Para ver la información de cada estudiante, desplácese usando estos
    botones.`,
  },
];

/**
 * VisitsTable
 *
 * Search and display the visits on a course.
 * The course is provided by the URL
 *
 */
const VisitsTable = (props) => {
  const course = useSelector((state) => state.course);
  const visits = useSelector((state) => state.visits);
  const dispatch = useDispatch();

  const resetVisits = useCallback(
    () => dispatch(visitActions.resetVisits()),
    []
  );
  const recoverCourseStudentVisitSum = useCallback(
    (i, l, u) => dispatch(visitActions.recoverCourseStudentVisitSum(i, l, u)),
    []
  );
  const recoverDailyChapterVisits = useCallback(
    (i, l, u) => dispatch(visitActions.recoverDailyChapterVisits(i, l, u)),
    []
  );

  const [state, setState, errors, setErrors, removeErrors] = useLoadCourseInfo(
    props.match,
    resetVisits,
    visits.errors
  );

  const [tableData, setTableData, rowData, _] = useProcessSumData(
    visits.added_visits,
    'vertical__vertical',
    recoverCourseStudentVisitSum,
    errors,
    setErrors,
    state.upperDate,
    state.lowerDate
  );

  const [dailyState, __] = useProcessDailyData(
    visits.added_chapter_visits,
    recoverDailyChapterVisits,
    errors,
    state.lowerDate,
    state.upperDate
  );

  // Load data when the button trigers
  const submit = () => {
    if (state.current !== '') {
      if (state.lowerDate === '' && state.upperDate === '') {
        setErrors([...errors, 'Por favor ingrese fechas válidas']);
      } else if (!state.allowed) {
        setErrors([...errors, 'No tienes permisos para consultar estos datos']);
      } else {
        setTableData({ ...tableData, loaded: false });
        dispatch(courseActions.recoverCourseStructure(state.current));
        setErrors([]);
        dispatch(actions.cleanErrors());
      }
    }
  };

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
      rowData.loaded &&
      localStorage.getItem('tutorial-visitstable') === null
    ) {
      showTutorial();
      localStorage.setItem('tutorial-visitstable', 'seen');
    }
  }, [rowData.loaded]);

  // Load chart info right away
  useEffect(() => {
    state.courseName !== '' && submit();
  }, [state.courseName]);

  return (
    <Container className="rounded-lg shadow-lg py-4 px-5 data-view">
      <Helmet>
        <title>Visitas por Módulo</title>
      </Helmet>
      <Row>
        <Col>
          <Breadcrumb className="eol-breadcrumb">
            <Link className="breadcrumb-item" to={`/search`}>
              <FontAwesomeIcon icon={faHome} /> General
            </Link>
            <Breadcrumb.Item href="#">
              <Link
                className="breadcrumb-item"
                to={`/courses/${props.match.params.course_id}`}
              >
                {`Resumen ${state.current}`}
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item href="#" active>{`Visitas`}</Breadcrumb.Item>
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
            )}
          </h2>
          <p>
            Este curso tiene fechas de inicio{' '}
            {new Date(props.match.params.start).toLocaleDateString('es-ES')} y
            de término{' '}
            {new Date(props.match.params.end).toLocaleDateString('es-ES')}.
            También se puede buscar fuera de estos límites de tiempo.
          </p>
        </Col>
      </Row>
      <Row style={{ marginBottom: '1rem' }} className="date-table-selectors">
        <Col sm={12} lg={4}>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Fecha de Inicio</InputGroup.Text>
            </InputGroup.Prepend>
            <Input
              id="visits-lDate"
              data-testid="visits-lDate"
              type="date"
              value={state.lowerDate}
              onChange={(e) =>
                setState({ ...state, lowerDate: e.target.value })
              }
            />
          </InputGroup>
        </Col>
        <Col sm={12} lg={4}>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Fecha de Fin</InputGroup.Text>
            </InputGroup.Prepend>
            <Input
              id="visits-uDate"
              data-testid="visits-uDate"
              type="date"
              value={state.upperDate}
              onChange={(e) =>
                setState({ ...state, upperDate: e.target.value })
              }
            />
          </InputGroup>
        </Col>
        <Col sm={12} lg={4}>
          <Button onClick={submit} block>
            Explorar <FontAwesomeIcon icon={faSearch} />
          </Button>
        </Col>
      </Row>
      {course.course_status === 'loading' && !tableData.loaded ? (
        <Row>
          <Col style={{ textAlign: 'center' }}>
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      ) : tableData.loaded ? (
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
          <Row style={{ marginTop: '1em' }}>
            <Col>
              <h4>Visitas de estudiantes por Módulo</h4>
              <ul>
                <li>
                  <a href="#VisitasTotales">Visitas totales</a>
                </li>
                <li>
                  <a href="#date-browser">Visitas diarias</a>
                </li>
                <li>
                  <a href="#DetallesPorEstudiante">Detalle por estudiante</a>
                </li>
                <li>
                  <a href="#DatosUtilizados">Datos utilizados</a>
                </li>
              </ul>
            </Col>
          </Row>
          <Container fluid id="VisitasTotales">
            <Row>
              <Col>
                <h4>Visitas totales</h4>
              </Col>
            </Row>
            {rowData.loaded && rowData.verticals.length > 0 ? (
              <VisitTotals rowData={rowData} tableData={tableData} />
            ) : errors.length === 0 && !rowData.loaded ? (
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
          </Container>
          <DateBrowser
            title="Visitas diarias"
            data={dailyState.sumByMonths}
            mapping={dailyState.chapterKeys}
            loading={dailyState.computing}
            haveErrors={errors.length !== 0}
          />
          <StudentDetails
            tableData={tableData}
            title={'Visitas'}
            rowData={rowData}
            doAnimation
          />
          <Row>
            <Col>
              <h4 id="DatosUtilizados">Datos utilizados</h4>
              <h4>¿Qué se contabiliza?</h4>
              <p>
                Las visitas presentadas corresponden a información sobre la{' '}
                <strong>navegación</strong> del usuario, principalmente
                utilizando los botones de avanzar y retroceder. Esto no
                representa toda las visitas del usuario, ya que excluye
                refrescos de página por ejemplo.
              </p>
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

VisitsTable.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default VisitsTable;
