import React, { useCallback, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Spinner,
  Alert,
  InputGroup,
  Container,
  Breadcrumb,
} from 'react-bootstrap';
import { Button, Input } from '@edx/paragon';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { timesActions } from '.';
import { student as studentActions } from '../data/actions';
import { StudentDetails, StudentInfoModal } from '../common';
import { TimesAvg, TimeVsVisits } from './components';
import {
  useLoadCourseInfo,
  useLoadStructureOnSubmit,
  useLoadStudentInfo,
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
import { parseFloatToTimeString } from '../helpers';
import { timesTutorial as steps } from '../data/tutorials';
/**
 * TimesTable
 *
 * Search and display the student spent time on a course.
 * Dates can be changed with the button above.
 * Handle errors from course info, course structure and data states.
 * The course and dates can be provided by the URL.
 * @param {Object} props
 * @returns
 */
const TimesTable = (props) => {
  const course = useSelector((state) => state.course);
  const times = useSelector((state) => state.times);
  const dispatch = useDispatch();

  const resetTimes = useCallback(() => dispatch(timesActions.resetTimes()), []);
  const recoverCourseStudentTimesSum = useCallback(
    (i, l, u) => dispatch(timesActions.recoverCourseStudentTimesSum(i, l, u)),
    []
  );

  const [state, setState, errors, setErrors, removeErrors] = useLoadCourseInfo(
    props.match,
    resetTimes,
    times.errors
  );

  const [tableData, setTableData, rowData, setRowData] = useProcessSumData(
    times.added_times,
    'vertical__vertical',
    recoverCourseStudentTimesSum,
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
    'tutorial-timestable'
  );

  return (
    <Container className="rounded-lg shadow-lg py-4 px-5 data-view">
      <Helmet>
        <title>Tiempos por secciones</title>
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
            <Breadcrumb.Item href="#" active>{`Tiempos`}</Breadcrumb.Item>
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
          Tiempo de visualización general por Módulo
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
              id="times-lDate"
              data-testid="times-lDate"
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
              id="times-uDate"
              data-testid="times-uDate"
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
              <h4>Tiempo de visualización por estudiantes</h4>
              <ul>
                <li>
                  <a href="#Tiempototal">Tiempo total</a>
                </li>
                <li>
                  <a href="#TiempoPromedio">Tiempo promedio</a>
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
          <Container fluid id="Tiempototal">
            <Row>
              <Col>
                <h4>Tiempo total</h4>
              </Col>
            </Row>
            {rowData.loaded && rowData.verticals.length > 0 ? (
              <TimeVsVisits rowData={rowData} tableData={tableData} />
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
          <Container fluid id="TiempoPromedio">
            <Row>
              <Col>
                <h4>Tiempo promedio</h4>
              </Col>
            </Row>
            {rowData.loaded && rowData.verticals.length > 0 ? (
              <TimesAvg rowData={rowData} tableData={tableData} />
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
          <StudentInfoModal
            isOpen={modal}
            doToggle={setModal}
            data={studentInfo}
            errors={modalErrors}
          />
          <Container fluid id="DetallesPorEstudiante">
            <Row style={{ marginTop: '1em' }}>
              <Col>
                <h4>Detalle por estudiante</h4>
              </Col>
            </Row>
            <StudentDetails
              title="Tiempos"
              rowData={rowData}
              tableData={tableData}
              parseFunction={parseFloatToTimeString}
              clickFunction={(user) => {
                setUser({ username: user });
                setModal(!modal);
              }}
              doTotal
              doAnimation
            />
          </Container>
          <Row>
            <Col>
              <h4 id="DatosUtilizados">Datos utilizados</h4>
              <h4>¿Qué se contabiliza?</h4>
              <p>
                Se estiman primero visitas, se leen eventos como la navegación
                del usuario entre páginas para contar el tiempo entre ellos, se
                identifica módulo del curso, para finalmente descartar sesiones
                con inactividad muy prolongada.
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

TimesTable.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default TimesTable;
