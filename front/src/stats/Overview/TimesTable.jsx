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
import { Button, CheckBox, Input } from '@edx/paragon';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { course, times, actions } from './data/actions';
import { selectMyCourses } from './data/reducers';
import {
  AsyncCSVButton,
  MultiAxisBars,
  ErrorBarChart,
  StudentDetails,
} from './components';
import { useProcessSumData } from './hooks';
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

/**
 * TimesTable
 *
 * Search and display the student spent time on a course.
 * The course can be provided by the URL, the
 *
 */
const TimesTable = ({
  course,
  times,
  myCourses,
  recoverCourseStructure,
  setLoadingCourse,
  getUserCourseRoles,
  getEnrolledCourses,
  resetCourseStructure,
  recoverCourseStudentTimesSum,
  resetTimes,
  setSelectedCourse,
  cleanErrors,
  match,
}) => {
  const [state, setState] = useState({
    current: match.params.course_id ? match.params.course_id : '',
    lowerDate: match.params.start ? match.params.start : '',
    upperDate: match.params.end ? match.params.end : '',
    courseName: '',
    useChaptersChart: false,
    useChaptersAverage: false,
  });

  const [errors, setErrors] = useState([]);

  const [tableData, setTableData, rowData, setRowData] = useProcessSumData(
    course,
    times.added_times,
    'event_type_vertical',
    recoverCourseStudentTimesSum,
    setErrors,
    state.upperDate,
    state.lowerDate
  );

  // Load data when the button trigers
  const submit = () => {
    if (state.current !== '') {
      if (state.lowerDate === '' && state.upperDate === '') {
        setErrors([...errors, 'Por favor ingrese fechas válidas']);
      } else {
        setLoadingCourse();
        setTableData({ ...tableData, loaded: false });
        recoverCourseStructure(state.current);
        setErrors([]);
      }
    }
  };

  // Load course info only when necessary
  // Add clean up functions
  useEffect(() => {
    if (myCourses.length === 0) {
      setLoadingCourse('course_roles');
      getUserCourseRoles();
      getEnrolledCourses();
    }
    setSelectedCourse(match.params.course_id);
    return () => {
      resetTimes();
      resetCourseStructure();
      cleanErrors();
    };
  }, []);

  useEffect(() => {
    if (myCourses.length !== 0) {
      let thisCourse = myCourses.filter(
        (el) => el.key === match.params.course_id
      )[0];
      thisCourse && setState({ ...state, courseName: thisCourse.title });
    }
  }, [myCourses]);

  useEffect(() => {
    state.courseName !== '' && submit();
  }, [state.courseName]);

  // Copy errors to local state
  useEffect(() => {
    if (course.errors.length > 0 || times.errors.length > 0) {
      setErrors([...errors, ...course.errors, ...times.errors]);
    }
  }, [course.errors, times.errors]);

  const toggleChapters = (checked, key) => {
    setState({ ...state, [key]: checked });
  };

  const removeErrors = (msg) => {
    let newErrors = errors.filter((el) => msg !== el);
    setErrors(newErrors);
  };

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

  const averageChart = useMemo(
    () =>
      rowData.verticals.map((v, k) => ({
        'Tiempo promedio visto': v.visits / (v.students === 0 ? 1 : v.students),
        errorX: rowData.vertical_errors[k],
        ...v,
      })),
    [rowData.verticals]
  );

  const averageChapterChart = useMemo(
    () =>
      rowData.grouped_verticals.map((el, k) => ({
        'Tiempo promedio visto':
          el.visits / (el.students === 0 ? 1 : el.students),
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

  const csvData = useMemo(
    () => [
      ['Sección', ...tableData.verticals.map((el) => el.val)],
      ['Tiempo total (s)', ...rowData.verticals.map((el) => el.visits)],
    ],
    [tableData.verticals, rowData.verticals]
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
    <Container className="rounded-lg shadow-lg py-4 px-5 my-2 data-view">
      <Helmet>
        <title>
          Tiempos por módulos
          {!course.loading & tableData.loaded
            ? `: ${course.course[0].name}`
            : ''}
        </title>
      </Helmet>
      <Row>
        <Col>
          <Breadcrumb>
            <Link className="breadcrumb-item" to="/modules">
              General
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
            {state.courseName === '' ? (
              <Spinner animation="border" variant="primary" />
            ) : (
              state.courseName
            )}
          </h2>
          Tiempo de visita de estudiantes por Módulo
          <p>
            Este curso tiene fechas de inicio{' '}
            {new Date(match.params.start).toLocaleDateString('es-ES')} y de
            término {new Date(match.params.end).toLocaleDateString('es-ES')}.
            También se puede buscar fuera de estos límites de tiempo.
          </p>
        </Col>
      </Row>
      <Row style={{ marginBottom: '1rem' }}>
        <Col className="col-xs-12 col-sm-12 col-md-4">
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
        <Col className="col-xs-12 col-sm-12 col-md-4">
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
        <Col className="col-xs-12 col-sm-12 col-md-4">
          <Button variant="success" onClick={submit} block>
            Buscar
          </Button>
        </Col>
      </Row>
      {course.loading && !tableData.loaded ? (
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
              </ul>
            </Col>
          </Row>
          <Row>
            <Col>
              <h5 id="Tiempototal">Tiempo total</h5>
            </Col>
          </Row>
          {rowData.verticals.length > 0 ? (
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
                  <CheckBox
                    name="checkbox"
                    label="Agrupar Módulos"
                    checked={state.useChaptersChart}
                    onClick={(e) => {
                      toggleChapters(e.target.checked, 'useChaptersChart');
                    }}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <MultiAxisBars
                    data={
                      state.useChaptersChart
                        ? rowDataChaptersChart
                        : rowDataChart
                    }
                    bar1_key="Tiempo de visualización"
                    bar2_key="Visitas Únicas usuarios"
                    name_key="val"
                    x_label={
                      state.useChaptersChart ? 'Módulos' : 'Unidades del curso'
                    }
                    y1_label="Tiempo"
                    y2_label="Visitas"
                    tooltipLabel={!state.useChaptersChart} // modules already have labels
                  />
                </Col>
              </Row>
            </Fragment>
          ) : (
            <Row>
              <Col>No hay datos</Col>
            </Row>
          )}
          <Row>
            <Col>
              <h5 id="TiempoPromedio">Tiempo promedio</h5>
            </Col>
          </Row>
          {rowData.verticals.length > 0 ? (
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
                  <CheckBox
                    name="checkbox"
                    label="Agrupar Módulos"
                    checked={state.useChaptersAverage}
                    onClick={(e) => {
                      toggleChapters(e.target.checked, 'useChaptersAverage');
                    }}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <ErrorBarChart
                    data={
                      state.useChaptersAverage
                        ? averageChapterChart
                        : averageChart
                    }
                    area_key="Tiempo promedio visto"
                    name_key="val"
                    x_label={
                      state.useChaptersAverage
                        ? 'Módulos'
                        : 'Unidades del curso'
                    }
                    y_label="Tiempo"
                    tooltipLabel={!state.useChaptersAverage} // modules already have labels
                  />
                </Col>
              </Row>
            </Fragment>
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
                  onClick={() => removeErrors(e)}
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
  setLoadingCourse: PropTypes.func.isRequired,
  getUserCourseRoles: PropTypes.func.isRequired,
  getEnrolledCourses: PropTypes.func.isRequired,
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
  myCourses: selectMyCourses(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      recoverCourseStructure: course.recoverCourseStructure,
      setLoadingCourse: course.setLoadingCourse,
      getUserCourseRoles: course.getUserCourseRoles,
      getEnrolledCourses: course.getEnrolledCourses,
      resetCourseStructure: course.resetCourseStructure,
      recoverCourseStudentTimesSum: times.recoverCourseStudentTimesSum,
      resetTimes: times.resetTimes,
      setSelectedCourse: actions.setSelectedCourse,
      cleanErrors: actions.cleanErrors,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(TimesTable);
