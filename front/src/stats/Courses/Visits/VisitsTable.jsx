import React, { useCallback, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Row, Col, Breadcrumb, InputGroup, Container } from 'react-bootstrap';
import { Button, Input, Spinner, Alert } from '@edx/paragon';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { student as studentActions } from '../data/actions';
import { visitActions } from '.';
import { RadialBar, StudentInfoModal } from '../common';
import {
  VisitTotals,
  DateBrowser,
  StudentVisits,
  CompletionTotals,
} from './components';
import { useProcessDailyData, useProcessSumCompletion } from './hooks';
import {
  useLoadCourseInfo,
  useLoadStudentInfo,
  useLoadStructureOnSubmit,
  useProcessSumData,
  useShowTutorial,
} from '../hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faSearch,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import '../common/TableandChart.css';
import { visitsTutorial as steps } from '../data/tutorials';

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
  const recoverCourseStudentCompletionSum = useCallback(
    (i, l, u) =>
      dispatch(visitActions.recoverCourseStudentCompletionSum(i, l, u)),
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

  const [tableData, setTableData, rowData, x] = useProcessSumData(
    visits.added_visits,
    'vertical__vertical',
    recoverCourseStudentVisitSum,
    errors,
    setErrors,
    state.upperDate,
    state.lowerDate
  );

  const [rowCompletion, y] = useProcessSumCompletion(
    tableData,
    visits.added_completions,
    'vertical__vertical',
    recoverCourseStudentCompletionSum,
    errors,
    setErrors,
    state.upperDate,
    state.lowerDate
  );

  const submit = useLoadStructureOnSubmit(
    state,
    setErrors,
    tableData,
    setTableData
  );

  const [dailyState, __] = useProcessDailyData(
    visits.added_chapter_visits,
    recoverDailyChapterVisits,
    errors,
    state.lowerDate,
    state.upperDate
  );

  const resetStudentInfo = useCallback(
    () => dispatch(studentActions.resetStudents()),
    []
  );
  const recoverStudentInfo = useCallback(
    (c_id, u) => dispatch(studentActions.recoverStudentInfo(c_id, u)),
    []
  );

  const [modal, setModal, studentInfo, modalErrors, setUser] =
    useLoadStudentInfo(recoverStudentInfo, resetStudentInfo);

  const showTutorial = useShowTutorial(
    steps,
    rowData.loaded,
    'tutorial-visitstable'
  );

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
                {/* <li>
                  <a href="#Completitud">Completitud</a>
                </li> */}
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
          {/* <Container fluid id="Completitud">
            <Row>
              <Col>
                <h4>Completitud</h4>
              </Col>
            </Row>
            {rowCompletion.loaded && rowCompletion.verticals.length > 0 ? (
              <CompletionTotals rowData={rowCompletion} tableData={tableData} />
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
          </Container> */}
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
          <StudentInfoModal
            isOpen={modal}
            doToggle={setModal}
            data={studentInfo}
            errors={modalErrors}
          />
          <StudentVisits
            visits={rowData}
            completion={rowCompletion}
            tableData={tableData}
            clickFunction={(user) => {
              setUser({ username: user });
              setModal(!modal);
            }}
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
