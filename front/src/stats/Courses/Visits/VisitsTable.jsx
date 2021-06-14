import React, { useEffect, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Row, Col, Breadcrumb, InputGroup, Container } from 'react-bootstrap';
import { Button, Input, Spinner, Alert } from '@edx/paragon';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { course, actions } from '../data/actions';
import { visitActions } from '.';
import { getMyCourses, getHasCourses } from '../data/selectors';
import { StudentDetails } from '../common';
import { VisitTotals, DateBrowser } from './components';
import { useProcessDailyData } from './hooks';
import { useProcessSumData, useLoadCourseInfo } from '../hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch } from '@fortawesome/free-solid-svg-icons';
import '../common/TableandChart.css';

/**
 * VisitsTable
 *
 * Search and display the visits on a course.
 * The course is provided by the URL
 *
 */
const VisitsTable = (props) => {
  const [state, setState, errors, setErrors, removeErrors] = useLoadCourseInfo(
    props.match,
    props.resetVisits,
    props.resetCourseStructure,
    props.cleanErrors,
    props.course.status,
    props.course.errors,
    props.visits.errors,
    props.myCourses,
    props.hasCourses
  );

  const [tableData, setTableData, rowData, _] = useProcessSumData(
    props.course,
    props.visits.added_visits,
    'vertical',
    props.recoverCourseStudentVisitSum,
    errors,
    setErrors,
    state.upperDate,
    state.lowerDate
  );

  const [dailyState, __] = useProcessDailyData(
    props.visits.added_chapter_visits,
    props.course,
    props.recoverDailyVisits,
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
        props.recoverCourseStructure(state.current);
        setErrors([]);
        props.cleanErrors();
      }
    }
  };

  // Load chart info right away
  useEffect(() => {
    state.courseName !== '' && submit();
  }, [state.courseName]);

  return (
    <Container className="rounded-lg shadow-lg py-4 px-5 data-view">
      <Helmet>
        <title>
          Visitas por Módulo
          {(props.course.status === 'successs') & tableData.loaded
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
            >{`Visitas ${state.current}`}</Breadcrumb.Item>
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
  hasCourses: PropTypes.bool.isRequired,
  resetCourseStructure: PropTypes.func.isRequired,
  recoverCourseStudentVisitSum: PropTypes.func.isRequired,
  recoverDailyVisits: PropTypes.func.isRequired,
  resetVisits: PropTypes.func.isRequired,
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
      resetCourseStructure: course.resetCourseStructure,
      recoverCourseStudentVisitSum: visitActions.recoverCourseStudentVisitSum,
      recoverDailyVisits: visitActions.recoverDailyChapterVisits,
      resetVisits: visitActions.resetVisits,
      cleanErrors: actions.cleanErrors,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(VisitsTable);
