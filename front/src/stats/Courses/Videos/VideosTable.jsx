import React, { useEffect, useCallback, useState, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Row, Col, Breadcrumb, InputGroup, Container } from 'react-bootstrap';
import { Button, Input, Spinner, Alert } from '@edx/paragon';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { course as courseActions, actions } from '../data/actions';
import { videosActions } from '.';
import { TotalViews, VideoCoverage, VideoDetailed } from './components';
import { useLoadCourseInfo } from '../hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faSearch,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import '../common/TableandChart.css';

const steps = [
  {
    title: 'Actividad por videos',
    intro: 'Aquí podrá ver la actividad de los videos del curso.',
  },
  {
    element: '.date-table-selectors',
    title: 'Actividad por videos',
    intro: `Si quiere ver las estadísticas de otro periodo de tiempo
    seleccione las fechas deseadas y luego cárguelas con el botón Explorar.`,
  },
  {
    element: '#VisualizacionesTotales',
    title: 'Visualizaciones totales',
    intro: `En esta sección se cargarán las visualizaciones de cada video, 
    incluyendo repeticiones, 
    acompañado de la cantidad de estudiantes que
    vieron el contenido.`,
  },
  {
    element: '#VisualizacionesTotales .pgn__form-group',
    intro: `Puede seleccionar la vista desagrupada
    para una vista más particular de cada unidad.`,
  },
  {
    element: '#VisualizacionesTotales a',
    intro: `También puede descargar esta información en una planilla de cálculos.`,
  },
  {
    element: '#Cobertura',
    title: 'Cobertura',
    intro: `En esta sección se cargará la cantidad de usuarios que han visto
    en completitud los videos y cuántos no lo han hecho.
    Las estadísticas en verde corresponden a visualizaciones completas.
    También puede descargar esta información en una planilla de cálculos
    usando el botón.`,
  },
  {
    element: '#DetallesPorVideo',
    title: 'Detalle por video',
    intro: `En esta sección se cargará una linea de tiempo que contempla
    de principio a fin los segmentos reproducidos de un video.
    Las estadísticas en azul oscuro corresponden a repeticiones.
    También puede descargar esta información en una planilla de cálculos
    usando el botón.`,
  },
  {
    element: '#DetallesPorVideo .pgn__form-group',
    title: 'Detalle por video',
    intro: `Para ver la información de otro video, seleccionelo en la lista
    desplegable.`,
  },
];

/**
 * VideosTable
 *
 * Search and display the videos on a course and its statistics.
 * The course is provided by the URL
 *
 */
const VideosTable = (props) => {
  const course = useSelector((state) => state.course);
  const dispatch = useDispatch();

  const videos = useSelector((state) => state.videos);

  const resetVideos = useCallback(
    () => dispatch(videosActions.resetVideos()),
    []
  );

  const [state, setState, errors, setErrors, removeErrors] = useLoadCourseInfo(
    props.match,
    resetVideos,
    videos.errors
  );

  // Load data when the button trigers
  const submit = () => {
    if (state.current !== '') {
      if (state.lowerDate === '' && state.upperDate === '') {
        setErrors([...errors, 'Por favor ingrese fechas válidas']);
      } else if (!state.allowed) {
        setErrors([...errors, 'No tienes permisos para consultar estos datos']);
      } else {
        //setTableData({ ...tableData, loaded: false });
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
      course.status === 'success' &&
      localStorage.getItem('tutorial-videostable') === null
    ) {
      showTutorial();
      localStorage.setItem('tutorial-videostable', 'seen');
    }
  }, [course.status]);

  // Load chart info right away
  useEffect(() => {
    state.courseName !== '' && submit();
  }, [state.courseName]);

  return (
    <Container className="rounded-lg shadow-lg py-4 px-5 my-2">
      <Helmet>
        <title>Actividad por videos</title>
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
            <Breadcrumb.Item href="#" active>{`Videos`}</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Row>
        <Col>
          {state.allowed && course.status === 'success' && (
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
              id="videos-lDate"
              data-testid="videos-lDate"
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
              id="videos-uDate"
              data-testid="videos-uDate"
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
      {course.status === 'loading' ? (
        <Row>
          <Col style={{ textAlign: 'center' }}>
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      ) : course.status === 'success' ? (
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
              <h4>Visualizaciones por Video</h4>
              <ul>
                <li>
                  <a href="#VisualizacionesTotales">Visualizaciones totales</a>
                </li>
                <li>
                  <a href="#Cobertura">Cobertura</a>
                </li>
                <li>
                  <a href="#DetallesPorVideo">Detalles por video</a>
                </li>
                <li>
                  <a href="#DatosUtilizados">Datos utilizados</a>
                </li>
              </ul>
            </Col>
          </Row>
          <TotalViews state={state} errors={errors} setErrors={setErrors} />
          <VideoCoverage state={state} errors={errors} setErrors={setErrors} />
          {/* <VideoDetailed state={state} errors={errors} setErrors={setErrors} /> */}
          <Row>
            <Col>
              <h4 id="DatosUtilizados">Datos utilizados</h4>
              <h4>¿Qué se contabiliza?</h4>
              <p>
                Las visualizaciones presentadas corresponden a información sobre
                la <strong>actividad</strong> del usuario, principalmente
                utilizando los botones de reproducir y pausar. Esto no
                representa toda las visualizaciones del usuario, ya que excluye
                refrescos de página por ejemplo. Además, un video se considera
                cubierto (visualizado completamente) si el usuario ha
                reproducido al menos el 90% del video.
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

VideosTable.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default VideosTable;
