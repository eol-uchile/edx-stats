import React, { useEffect, useCallback, Fragment } from 'react';
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
import { course as courseActions, actions } from '../data/actions';
import { StudentDetails } from '../common';
import { TimesAvg, TimeVsVisits } from './components';
import { useLoadCourseInfo, useProcessSumData } from '../hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch } from '@fortawesome/free-solid-svg-icons';
import '../common/TableandChart.css';

const parseFloatToTimeString = (seconds) => {
  if (typeof seconds != 'number') {
    return seconds;
  }
  let secs = `${seconds % 60}`;
  let mins = `${Math.floor(seconds / 60) % 60}`;
  let hours = Math.floor(seconds / 3600);
  if (hours > 0) {
    return `${hours}:${mins.length === 1 ? '0' + mins : mins}:${
      secs.length === 1 ? '0' + secs : secs
    }`;
  }
  return `${mins.length === 1 ? '0' + mins : mins}:${
    secs.length === 1 ? '0' + secs : secs
  }`;
};

/**
 * TimesTable
 *
 * Search and display the student spent time on a course.
 * The course can be provided by the URL, the
 *
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

  // Refresh course info and load
  useEffect(() => {
    state.courseName !== '' && submit();
  }, [state.courseName]);

  return (
    <Container className="rounded-lg shadow-lg py-4 px-5 data-view">
      <Helmet>
        <title>
          Tiempos por módulos
          {(course.status === 'success') & tableData.loaded
            ? `: ${course.course[0].name}`
            : ''}
        </title>
      </Helmet>
      <Row>
        <Col>
          <Breadcrumb className="eol-breadcrumb">
            <Link
              className="breadcrumb-item"
              to={`/courses/${props.match.params.course_id}`}
            >
              <FontAwesomeIcon icon={faHome} /> General
            </Link>
            <Breadcrumb.Item
              href="#"
              active
            >{`Tiempos ${state.current}`}</Breadcrumb.Item>
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
      {course.status === 'loading' && !tableData.loaded ? (
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
          <Row>
            <Col>
              <h4 id="Tiempototal">Tiempo total</h4>
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
          <Row>
            <Col>
              <h4 id="TiempoPromedio">Tiempo promedio</h4>
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
          <StudentDetails
            title="Tiempos"
            rowData={rowData}
            tableData={tableData}
            parseFunction={parseFloatToTimeString}
            doTotal
            doAnimation
          />
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
