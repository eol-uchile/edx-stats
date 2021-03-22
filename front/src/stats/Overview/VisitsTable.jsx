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
import { Button, Input, ValidationFormGroup } from '@edx/paragon';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { course, visits, actions } from './data/actions';
import { getMyCourses } from './data/reducers';
import { AsyncCSVButton, StudentDetails, ParallelBar } from './components';
import { useProcessSumData } from './hooks';
import './TableandChart.css';

/**
 * VisitsTable
 *
 * Search and display the visits on a course.
 * The course is provided by the URL
 *
 */
const VisitsTable = ({
  course,
  visits,
  recoverCourseStructure,
  recoverCourseStudentVisitSum,
  setLoadingCourse,
  getEnrolledCourses,
  getUserCourseRoles,
  resetCourseStructure,
  setSelectedCourse,
  resetVisits,
  cleanErrors,
  myCourses,
  match,
}) => {
  const [state, setState] = useState({
    current: match.params.course_id ? match.params.course_id : '',
    lowerDate: match.params.start ? match.params.start : '',
    upperDate: match.params.end ? match.params.end : '',
    courseName: '',
    useChaptersTable: true,
    useChaptersChart: false,
  });

  const [errors, setErrors] = useState([]);

  const [tableData, setTableData, rowData, setRowData] = useProcessSumData(
    course,
    visits.added_visits,
    'vertical',
    recoverCourseStudentVisitSum,
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
      resetVisits();
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
    if (course.errors.length > 0 || visits.errors.length > 0) {
      setErrors([...course.errors, ...visits.errors]);
    }
  }, [course.errors, visits.errors]);

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
        'Visitas totales': v.visits,
        'Visitas Únicas usuarios': v.students,
        ...v,
      })),
    [rowData.verticals]
  );

  const rowDataChaptersChart = useMemo(
    () =>
      rowData.grouped_verticals.map((el, k) => ({
        'Visitas totales': el.visits,
        'Visitas Únicas usuarios': el.students,
        tooltip: tableData.chapters[k].name,
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

  return (
    <Container className="rounded-lg shadow-lg py-4 px-5 my-2 data-view">
      <Helmet>
        <title>
          Visitas por Módulo
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
            >{`Visitas ${state.current}`}</Breadcrumb.Item>
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
        <Col className="col-xs-12 col-sm-12 col-md-4">
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
              <h4>Visitas de estudiantes por Módulo</h4>
              <ul>
                <li>
                  <a href="#VisitasTotales">Visitas totales</a>
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
              <h5 id="VisitasTotales">Visitas totales</h5>
            </Col>
          </Row>
          {rowData.verticals.length > 0 ? (
            <Fragment>
              <Row>
                <Col>
                  <AsyncCSVButton
                    text="Descargar Datos"
                    filename="visitas_totales.csv"
                    headers={csvHeaders}
                    data={csvData}
                  />
                </Col>
                <Col>
                  <ValidationFormGroup for="group-mod-chapters-ch">
                    <Input
                      type="checkbox"
                      name="group-mod-chapters-ch"
                      id="group-mod-chapters-ch"
                      label="Agrupar Módulos"
                      checked={state.useChaptersChart}
                      onChange={(e) => {
                        toggleChapters(e.target.checked, 'useChaptersChart');
                      }}
                    />
                    <label htmlFor="group-mod-chapters-ch">
                      Agrupar Módulos
                    </label>
                  </ValidationFormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <ParallelBar
                    data={
                      state.useChaptersChart
                        ? rowDataChaptersChart
                        : rowDataChart
                    }
                    bar1_key="Visitas Únicas usuarios"
                    bar2_key="Visitas totales"
                    name_key="val"
                    x_label={
                      state.useChaptersChart ? 'Módulos' : 'Unidades del curso'
                    }
                    y_label="Visitas"
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
          <StudentDetails
            tableData={tableData}
            title={'Visitas'}
            rowData={rowData}
            doAnimation
          />
          <Row>
            <Col>
              <h4 id="DatosUtilizados">Datos utilizados</h4>
              <h5>¿Qué se contabiliza?</h5>
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
  course: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  visits: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  myCourses: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  recoverCourseStructure: PropTypes.func.isRequired,
  setLoadingCourse: PropTypes.func.isRequired,
  getUserCourseRoles: PropTypes.func.isRequired,
  getEnrolledCourses: PropTypes.func.isRequired,
  resetCourseStructure: PropTypes.func.isRequired,
  recoverCourseStudentVisitSum: PropTypes.func.isRequired,
  resetVisits: PropTypes.func.isRequired,
  setSelectedCourse: PropTypes.func.isRequired,
  cleanErrors: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = (state) => ({
  course: state.course,
  visits: state.visits,
  myCourses: getMyCourses(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      recoverCourseStructure: course.recoverCourseStructure,
      setLoadingCourse: course.setLoadingCourse,
      getUserCourseRoles: course.getUserCourseRoles,
      getEnrolledCourses: course.getEnrolledCourses,
      resetCourseStructure: course.resetCourseStructure,
      recoverCourseStudentVisitSum: visits.recoverCourseStudentVisitSum,
      resetVisits: visits.resetVisits,
      setSelectedCourse: actions.setSelectedCourse,
      cleanErrors: actions.cleanErrors,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(VisitsTable);
