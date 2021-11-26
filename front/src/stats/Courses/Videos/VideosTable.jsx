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
import { faHome, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import '../common/TableandChart.css';
import { useLoadVideos } from './hooks';
import { videosTutorial as steps } from '../data/tutorials';

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

  const recoverVideos = useCallback((i) => {
    dispatch(videosActions.recoverVideos(i));
  }, []);

  const [rowData, setRowData] = useLoadVideos(videos, recoverVideos);

  useEffect(() => {
    if (state.current !== '' && state.courseName !== '' && state.allowed) {
      dispatch(courseActions.recoverCourseStructure(state.current));
      setErrors([]);
      dispatch(actions.cleanErrors());
    }
  }, [state.current, state.courseName, state.allowed]);

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
      localStorage.getItem('tutorial-videostable') === null
    ) {
      showTutorial();
      localStorage.setItem('tutorial-videostable', 'seen');
    }
  }, [rowData.loaded]);

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
          <TotalViews barData={rowData} errors={errors} setErrors={setErrors} />
          <VideoCoverage
            barData={rowData}
            errors={errors}
            setErrors={setErrors}
          />
          <VideoDetailed
            videoDict={rowData}
            errors={errors}
            setErrors={setErrors}
          />
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
