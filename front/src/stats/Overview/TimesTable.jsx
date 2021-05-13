import React, { useEffect, useState, useMemo, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
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
import { Button, Input, Form } from '@edx/paragon';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { course, times, actions } from './data/actions';
import { getHasCourses, getMyCourses } from './data/selectors';
import {
  AsyncCSVButton,
  MultiAxisBars,
  ErrorBarChart,
  StudentDetails,
} from './components';
import { useProcessSumData, useLoadCourseInfo } from './hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch } from '@fortawesome/free-solid-svg-icons';
import './TableandChart.css';

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

const TimeVsVisits = ({ tableData, rowData }) => {
  const [state, setState] = useState(false);

  const csvHeaders = useMemo(
    () => ['Título', ...tableData.verticals.map((el) => el.tooltip)],
    [tableData.verticals]
  );

  const csvData = useMemo(
    () => [
      ['Sección', ...tableData.verticals.map((el) => el.val)],
      ['Tiempo total (s)', ...rowData.verticals.map((el) => el.visits)],
    ],
    [tableData.verticals, rowData.verticals]
  );

  const rowDataChart = useMemo(
    () =>
      rowData.verticals.map((v) => ({
        'Tiempo de visualización': v.visits,
        'Visitas Únicas usuarios': v.students,
        ...v,
      })),
    [rowData.verticals]
  );

  const rowDataChaptersChart = useMemo(
    () =>
      rowData.grouped_verticals.map((el, k) => ({
        'Tiempo de visualización': el.visits,
        'Visitas Únicas usuarios': el.students,
        tooltip: tableData.chapters[k].name,
        val: 'Módulo ' + (k + 1),
      })),
    [rowData.grouped_verticals]
  );

  return (
    <Fragment>
      <Row>
        <Col>
          <AsyncCSVButton
            text="Descargar Datos"
            filename="tiempos_totales.csv"
            headers={csvHeaders}
            data={csvData}
          />
        </Col>
        <Col>
          <Form.Group
            controlId="group-mod-chapters-ch"
            style={{
              paddingRight: '1.5rem',
            }}
            className="float-right"
          >
            <Form.Check
              type="switch"
              id="group-mod-chapters-ch"
              name="group-mod-chapters-ch"
              label="Agrupar Módulos"
              checked={state}
              onChange={(e) => {
                setState(e.target.checked);
              }}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <MultiAxisBars
            data={state ? rowDataChaptersChart : rowDataChart}
            bar1_key="Tiempo de visualización"
            bar2_key="Visitas Únicas usuarios"
            name_key="val"
            x_label={state ? 'Módulos' : 'Unidades del curso'}
            y1_label="Tiempo"
            y2_label="Visitas"
            tooltipLabel={!state} // modules already have labels
          />
        </Col>
      </Row>
    </Fragment>
  );
};

const TimesAvg = ({ tableData, rowData }) => {
  const [state, setState] = useState(false);

  const averageChart = useMemo(
    () =>
      rowData.verticals.map((v, k) => ({
        'Tiempo promedio visto':
          v.visits / (rowData.all.length !== 0 ? rowData.all.length : 1),
        errorX: rowData.vertical_errors[k],
        ...v,
      })),
    [rowData.verticals]
  );

  const averageChapterChart = useMemo(
    () =>
      rowData.grouped_verticals.map((el, k) => ({
        'Tiempo promedio visto':
          el.visits / (rowData.all.length !== 0 ? rowData.all.length : 1),
        tooltip: tableData.chapters[k].name,
        errorX: rowData.grouped_verticals_errors[k],
        val: 'Módulo ' + (k + 1),
      })),
    [rowData.grouped_verticals]
  );

  const csvHeaders = useMemo(
    () => ['Título', ...tableData.verticals.map((el) => el.tooltip)],
    [tableData.verticals]
  );

  const csvAvData = useMemo(
    () => [
      ['Sección', ...tableData.verticals.map((el) => el.val)],
      [
        'Tiempo promedio visto',
        ...averageChart.map((el) => el['Tiempo promedio visto']),
      ],
      ['Desviación estándar', ...averageChart.map((el) => el['errorX'])],
    ],
    [tableData.verticals, averageChart]
  );

  return (
    <Fragment>
      <Row>
        <Col>
          <AsyncCSVButton
            text="Descargar Datos"
            filename="tiempos_promedio.csv"
            headers={csvHeaders}
            data={csvAvData}
          />
        </Col>
        <Col>
          <Form.Group
            controlId="group-mod-chapters-ch-av"
            style={{
              paddingRight: '1.5rem',
            }}
            className="float-right"
          >
            <Form.Check
              type="switch"
              id="group-mod-chapters-ch-av"
              label="Agrupar Módulos"
              checked={state}
              onChange={(e) => {
                setState(e.target.checked);
              }}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <ErrorBarChart
            data={state ? averageChapterChart : averageChart}
            area_key="Tiempo promedio visto"
            name_key="val"
            x_label={state ? 'Módulos' : 'Unidades del curso'}
            y_label="Tiempo"
            tooltipLabel={!state} // modules already have labels
          />
        </Col>
      </Row>
    </Fragment>
  );
};

/**
 * TimesTable
 *
 * Search and display the student spent time on a course.
 * The course can be provided by the URL, the
 *
 */
const TimesTable = (props) => {
  const [state, setState, errors, setErrors, removeErrors] = useLoadCourseInfo(
    props.match,
    props.initCourses,
    props.resetTimes,
    props.resetCourseStructure,
    props.cleanErrors,
    props.course.status,
    props.course.errors,
    props.times.errors,
    props.myCourses,
    props.hasCourses,
    props.setSelectedCourse
  );

  const [tableData, setTableData, rowData, setRowData] = useProcessSumData(
    props.course,
    props.times.added_times,
    'event_type_vertical',
    props.recoverCourseStudentTimesSum,
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
        props.recoverCourseStructure(state.current);
        setErrors([]);
        props.cleanErrors();
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
          {(props.course.status === 'success') & tableData.loaded
            ? `: ${props.course.course[0].name}`
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
          <h2>
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
      <Row style={{ marginBottom: '1rem' }}>
        <Col className="col-xs-12 col-sm-12 col-lg-4">
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
        <Col className="col-xs-12 col-sm-12 col-lg-4">
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
        <Col className="col-xs-12 col-sm-12 col-lg-4">
          <Button variant="success" onClick={submit} block>
            Explorar <FontAwesomeIcon icon={faSearch} />
          </Button>
        </Col>
      </Row>
      {props.course.status === 'loading' && !tableData.loaded ? (
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
  course: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  times: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  myCourses: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types,
  recoverCourseStructure: PropTypes.func.isRequired,
  initCourses: PropTypes.func.isRequired,
  hasCourses: PropTypes.bool.isRequired,
  resetCourseStructure: PropTypes.func.isRequired,
  recoverCourseStudentTimesSum: PropTypes.func.isRequired,
  resetTimes: PropTypes.func.isRequired,
  setSelectedCourse: PropTypes.func.isRequired,
  cleanErrors: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = (state) => ({
  course: state.course,
  times: state.times,
  hasCourses: getHasCourses(state),
  myCourses: getMyCourses(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      recoverCourseStructure: course.recoverCourseStructure,
      initCourses: course.initCourseRolesInfo,
      resetCourseStructure: course.resetCourseStructure,
      recoverCourseStudentTimesSum: times.recoverCourseStudentTimesSum,
      resetTimes: times.resetTimes,
      setSelectedCourse: actions.setSelectedCourse,
      cleanErrors: actions.cleanErrors,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(TimesTable);
