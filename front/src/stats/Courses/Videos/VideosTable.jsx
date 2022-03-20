import React, { useCallback, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Row, Col, Breadcrumb, InputGroup, Container } from 'react-bootstrap';
import { Spinner, Alert } from '@edx/paragon';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { videosActions } from '.';
import { TotalViews, VideoCoverage, VideoDetailed } from './components';
import { useLoadCourseInfo, useLoadStructure, useShowTutorial } from '../hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import '../common/TableandChart.css';
import { useLoadVideos } from './hooks';
import { videosTutorial as steps } from '../data/tutorials';

/**
 * VideosTable
 *
 * Search and display the videos on a course and its statistics.
 * Handle errors from course info and course structure states.
 * The course can be provided by the URL.
 *
 */
const VideosTable = (props) => {
  const course = useSelector((state) => state.course);
  const videos = useSelector((state) => state.videos);
  const dispatch = useDispatch();

  const resetVideos = useCallback(
    () => dispatch(videosActions.resetVideos()),
    []
  );
  const recoverVideos = useCallback((i) => {
    dispatch(videosActions.recoverVideos(i));
  }, []);

  const [state, setState, errors, setErrors, removeErrors] = useLoadCourseInfo(
    props.match,
    resetVideos,
    videos.errors
  );

  const [courseVideos, setCourseVideos] = useLoadVideos(
    videos.video_list,
    recoverVideos,
    errors
  );

  const courseStructure = useLoadStructure(state, setErrors);

  const showTutorial = useShowTutorial(
    steps,
    courseVideos.loaded,
    'tutorial-videostable'
  );

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
      {course.course_status === 'loading' && !courseVideos.loaded ? (
        <Row>
          <Col style={{ textAlign: 'center' }}>
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      ) : courseVideos.loaded ? (
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
          <TotalViews courseVideos={courseVideos} errors={errors} />
          <VideoCoverage courseVideos={courseVideos} errors={errors} />
          <VideoDetailed courseVideos={courseVideos} errors={errors} />
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
