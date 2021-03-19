import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Spinner,
  ListGroup,
  ListGroupItem,
  Breadcrumb,
  Alert,
} from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { course, actions } from './data/actions';
import { getMyCourses } from './data/reducers';
import { ValidationFormGroup, Button, Card } from '@edx/paragon';
import { Link } from 'react-router-dom';
import { sortByColumn } from './helpers';
import PropTypes from 'prop-types';

const getDate = (d) => {
  let date = new Date(d);
  let dd = String(date.getDate()).padStart(2, '0');
  let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Landing Page
 *
 * @param {*} param0
 */
const Landing = ({
  loadingCourses,
  loadingEnrolled,
  loadingCoursesErrors,
  myCourses,
  selectedCache,
  getUserCourseRoles,
  getEnrolledCourses,
  setLoadingCourse,
  setSelectedCourse,
  lms,
}) => {
  const [state, setState] = useState({
    selected: -1,
    filtered: [{ label: '- Seleccionar curso -', value: -1 }],
    interacted: false,
    options: [['- Seleccionar curso -', -1]],
  });

  // Load course info only when necessary
  useEffect(() => {
    if (myCourses.length === 0) {
      setLoadingCourse('course_roles');
      getUserCourseRoles();
      getEnrolledCourses();
    }
  }, []);

  // Cache the selected course
  useEffect(() => {
    if (state.filtered.length > 1 && state.selected !== -1) {
      // Removing the final condition triggers an infinite loop WTF
      let key = state.filtered[state.selected].data.key;
      if (selectedCache !== key) {
        setSelectedCourse(key);
      }
    }
  }, [state.filtered, state.selected]);

  // Set default choice only if no user interaction has ocurred
  useEffect(() => {
    if (myCourses.length > 0 && state.filtered.length > 1) {
      let selected = state.filtered
        .slice(1)
        .filter((l) => l.data.key === selectedCache)[0];
      if (selected && !state.interacted) {
        setState({ ...state, selected: selected.value });
      }
    }
  }, [myCourses, selectedCache, state.filtered]);

  // Update choices
  useEffect(() => {
    if (myCourses.length !== 0) {
      let availableCourses = myCourses
        .filter((el) => !('student' in el.roles))
        .map((el, k) => ({
          label: `${el.title} (${el.key})`,
          value: k,
          data: el,
        }));
      let options = sortByColumn(
        availableCourses.map((el) => [el.label, el.value]),
        0,
        false,
        true
      );
      setState({
        ...state,
        filtered: availableCourses,
        options: [['- Seleccionar curso -', -1], ...options],
      });
    }
  }, [myCourses]);

  const start = state.filtered[state.selected]
    ? getDate(state.filtered[state.selected].data.start)
    : null;
  const end = state.filtered[state.selected]
    ? getDate(state.filtered[state.selected].data.end)
    : null;
  const key = state.filtered[state.selected]
    ? state.filtered[state.selected].data.key
    : null;

  const data = state.filtered[state.selected]
    ? state.filtered[state.selected].data
    : null;

  return (
    <Container className="rounded-lg shadow-lg py-4 px-5 my-2">
      <Row>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="#" active>
              General
            </Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Row>
        <Col>
          <h5>Sistema de estad&iacute;stica y an&aacute;lisis</h5>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Estad&iacute;sticas por m&oacute;dulos</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <p>
            Ver estad&iacute;sticas para cursos con acceso de <b>staff</b>,{' '}
            <b>instructor</b>, <b>investigador</b>, o <b>administrador</b>.
          </p>
        </Col>
      </Row>
      <Row>
        {loadingCourses && loadingEnrolled ? (
          <Col style={{ textAlign: 'center', lineHeight: '200px' }}>
            Cargando cursos <Spinner animation="border" variant="primary" />
          </Col>
        ) : loadingCoursesErrors.length !== 0 ? (
          <Col style={{ textAlign: 'center' }}>
            {loadingCoursesErrors.map((err, k) => (
              <Alert key={k} variant="warning">
                {err}
              </Alert>
            ))}
          </Col>
        ) : (
          <Col>
            <ValidationFormGroup
              for="my_courses"
              helpText="Seleccione un curso."
              valid={state.selected !== -1}
            >
              <label htmlFor="my_courses">Mis cursos</label>
              <select
                className="form-control"
                id="my_courses"
                data-testid="courses-select"
                name="cursos"
                value={state.selected}
                onChange={(e) => {
                  setState({
                    ...state,
                    selected: Number(e.target.value),
                    interacted: true,
                  });
                }}
              >
                {state.options.map((el) => (
                  <option key={el[1]} value={el[1]}>
                    {el[0]}
                  </option>
                ))}
              </select>
            </ValidationFormGroup>
            {state.options.length == 1 && (
              <p style={{ textAlign: 'center', lineHeight: '200px' }}>
                Cargando cursos ...{' '}
                <Spinner animation="border" variant="primary" />
              </p>
            )}
          </Col>
        )}
      </Row>
      {state.selected !== -1 && data !== null && (
        <Row style={{ marginBottom: '1rem' }}>
          <Col md={4}>
            <Card>
              <Card.Body>
                <Card.Title>{data.name}</Card.Title>
                <Card.Text>{data.short_description}</Card.Text>
                <Button
                  variant="primary"
                  href={`${lms}/courses/${data.key}/course`}
                >
                  Ver Curso
                </Button>
              </Card.Body>
              <Card.Img variant="bottom" src={data.image.src} alt="" />
            </Card>
          </Col>
          <Col md={8}>
            <ListGroup>
              <ListGroupItem>
                <h5>Consultar</h5>
              </ListGroupItem>
              <ListGroupItem>
                <Link to={`/modules/times/${key}/${start}/${end}`}>
                  Ver tiempo de visita por contenido
                </Link>
              </ListGroupItem>
              <ListGroupItem>
                <Link to={`/modules/visits/${key}/${start}/${end}`}>
                  Ver visitas por contenido
                </Link>
              </ListGroupItem>
            </ListGroup>
          </Col>
        </Row>
      )}
    </Container>
  );
};

Landing.propTypes = {
  loadingCourses: PropTypes.bool.isRequired,
  loadingEnrolled: PropTypes.bool.isRequired,
  loadingCoursesErrors: PropTypes.array.isRequired,
  myCourses: PropTypes.array.isRequired,
  lms: PropTypes.string,
  selectedCache: PropTypes.string,
  getUserCourseRoles: PropTypes.func.isRequired,
  getEnrolledCourses: PropTypes.func.isRequired,
  setLoadingCourse: PropTypes.func.isRequired,
  setSelectedCourse: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  loadingCourses: state.course.course_roles.loading,
  loadingEnrolled: state.course.courses_enrolled.loading,
  loadingCoursesErrors: state.course.errors,
  myCourses: getMyCourses(state),
  selectedCache: state.dashboard.selected,
  lms: state.urls.lms,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getUserCourseRoles: course.getUserCourseRoles,
      getEnrolledCourses: course.getEnrolledCourses,
      setLoadingCourse: course.setLoadingCourse,
      setSelectedCourse: actions.setSelectedCourse,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Landing);
