import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  getUserCourseRoles,
  setLoadingCourse,
  getEnrolledCourses,
} from './data/actions';
import { selectMyCourses } from './data/reducers';
import { InputSelect } from '@edx/paragon';
import PropTypes from 'prop-types';
import { TimesTable } from './components';

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
  myCourses,
  getUserCourseRoles,
  getEnrolledCourses,
  setLoadingCourse,
  match,
}) => {
  const [state, setState] = useState({
    selected: -1,
    filtered: [{ label: '- Seleccionar curso -', value: -1 }],
  });

  useEffect(() => {
    setLoadingCourse('course_roles');
    getUserCourseRoles();
    getEnrolledCourses();
  }, []);

  useEffect(() => {
    if (myCourses.length !== 0) {
      let availableCourses = myCourses
        .filter((el) => !('student' in el.roles))
        .map((el, k) => ({
          label: `${el.name} (${el.id})`,
          value: k + 1,
          data: el,
        }));
      setState({
        ...state,
        filtered: [
          { label: '- Seleccionar curso -', value: -1 },
          ...availableCourses,
        ],
      });
    }
  }, [myCourses]);

  const start = state.filtered[state.selected]
    ? getDate(state.filtered[state.selected].data.start)
    : null;
  const end = state.filtered[state.selected]
    ? getDate(state.filtered[state.selected].data.end)
    : null;
  const id = state.filtered[state.selected]
    ? state.filtered[state.selected].data.id
    : null;

  const data = state.filtered[state.selected]
    ? state.filtered[state.selected].data
    : null;

  return (
    <Container>
      <Row>
        <Col>
          <h2>Tiempo de visita por m&oacute;dulos</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <p>
            Buscar por nombre o c&oacute;digo de curso y para una fecha
            determinada.
          </p>
        </Col>
      </Row>
      <Row>
        {loadingCourses || loadingEnrolled ? (
          <Col style={{ textAlign: 'center', lineHeight: '200px' }}>
            Cargando cursos <Spinner animation="border" variant="primary" />
          </Col>
        ) : (
          <Col>
            <InputSelect
              name="courses-select"
              data-testid="courses-select"
              label="Mis Cursos"
              options={state.filtered}
              onChange={(value) =>
                setState({ ...state, selected: Number(value) })
              }
            />
          </Col>
        )}
      </Row>
      {state.selected !== -1 && state.filtered.length > 1 && (
        <TimesTable course_id={id} start={start} end={end} data={data} />
      )}
    </Container>
  );
};

Landing.propTypes = {
  loadingCourses: PropTypes.bool.isRequired,
  loadingEnrolled: PropTypes.bool.isRequired,
  myCourses: PropTypes.array.isRequired,
  getUserCourseRoles: PropTypes.func.isRequired,
  getEnrolledCourses: PropTypes.func.isRequired,
  setLoadingCourse: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  loadingCourses: state.course.course_roles.loading,
  loadingEnrolled: state.course.courses_enrolled.loading,
  myCourses: selectMyCourses(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getUserCourseRoles,
      getEnrolledCourses,
      setLoadingCourse,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Landing);
