import React, { useEffect, useState, useMemo, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Row, Col, Breadcrumb, InputGroup, Container } from 'react-bootstrap';
import { Button, Input, Spinner, Alert, Form } from '@edx/paragon';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { course, visits, actions } from './data/actions';
import { getMyCourses, getHasCourses } from './data/selectors';
import {
  AsyncCSVButton,
  StudentDetails,
  ParallelBar,
  DateBrowser,
} from './components';
import {
  useProcessSumData,
  useProcessDailyData,
  useLoadCourseInfo,
} from './hooks';
import './TableandChart.css';

const VisitTotals = ({ rowData, tableData }) => {
  const [state, setState] = useState(true);

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
          <Form.Group
            controlId="group-mod-chapters-ch"
            style={{
              justifyContent: 'end',
              display: 'flex',
              paddingRight: '1.5rem',
            }}
          >
            <Form.Check
              type="switch"
              name="group-mod-chapters-ch"
              id="group-mod-chapters-ch"
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
          <ParallelBar
            data={state ? rowDataChaptersChart : rowDataChart}
            bar1_key="Visitas Únicas usuarios"
            bar2_key="Visitas totales"
            name_key="val"
            x_label={state ? 'Módulos' : 'Unidades del curso'}
            y_label="Visitas"
            tooltipLabel={!state} // modules already have labels
          />
        </Col>
      </Row>
    </Fragment>
  );
};

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
  recoverDailyVisits,
  hasCourses,
  initCourses,
  resetCourseStructure,
  setSelectedCourse,
  resetVisits,
  cleanErrors,
  myCourses,
  match,
}) => {
  const [state, setState, errors, setErrors, removeErrors] = useLoadCourseInfo(
    match,
    initCourses,
    resetVisits,
    resetCourseStructure,
    cleanErrors,
    course.status,
    course.errors,
    visits.errors,
    myCourses,
    hasCourses,
    setSelectedCourse
  );

  const [tableData, setTableData, rowData, setRowData] = useProcessSumData(
    course,
    visits.added_visits,
    'vertical',
    recoverCourseStudentVisitSum,
    errors,
    setErrors,
    state.upperDate,
    state.lowerDate
  );

  const [dailyState, setDailyState] = useProcessDailyData(
    visits.added_chapter_visits,
    course,
    recoverDailyVisits,
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
        recoverCourseStructure(state.current);
        setErrors([]);
        cleanErrors();
      }
    }
  };

  // Load chart info right away
  useEffect(() => {
    state.courseName !== '' && submit();
  }, [state.courseName]);

  return (
    <Container className="rounded-lg shadow-lg py-4 px-5 my-2 data-view">
      <Helmet>
        <title>
          Visitas por Módulo
          {(course.status === 'successs') & tableData.loaded
            ? `: ${course.course[0].name}`
            : ''}
        </title>
      </Helmet>
      <Row>
        <Col>
          <Breadcrumb className="eol-breadcrumb">
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
          <Row>
            <Col>
              <h4 id="VisitasTotales">Visitas totales</h4>
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
  course: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  visits: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  myCourses: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  recoverCourseStructure: PropTypes.func.isRequired,
  initCourses: PropTypes.func.isRequired,
  hasCourses: PropTypes.bool.isRequired,
  resetCourseStructure: PropTypes.func.isRequired,
  recoverCourseStudentVisitSum: PropTypes.func.isRequired,
  recoverDailyVisits: PropTypes.func.isRequired,
  resetVisits: PropTypes.func.isRequired,
  setSelectedCourse: PropTypes.func.isRequired,
  cleanErrors: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = (state) => ({
  course: state.course,
  visits: state.visits,
  hasCourses: getHasCourses(state),
  myCourses: getMyCourses(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      recoverCourseStructure: course.recoverCourseStructure,
      initCourses: course.initCourseRolesInfo,
      resetCourseStructure: course.resetCourseStructure,
      recoverCourseStudentVisitSum: visits.recoverCourseStudentVisitSum,
      recoverDailyVisits: visits.recoverDailyChapterVisits,
      resetVisits: visits.resetVisits,
      setSelectedCourse: actions.setSelectedCourse,
      cleanErrors: actions.cleanErrors,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(VisitsTable);
