import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getUserCourseRoles, setLoadingCourse } from './data/actions';
import { Link } from 'react-router-dom';
import { Collapsible } from '@edx/paragon';
import PropTypes from 'prop-types';

const getDate = (d) => {
  let dd = String(d.getDate()).padStart(2, '0');
  let mm = String(d.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = d.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

const Landing = ({
  loadingCourses,
  courses,
  getUserCourseRoles,
  setLoadingCourse,
}) => {
  const [state, setState] = useState({
    selected: false,
    filtered: [],
    today: new Date(),
  });

  useEffect(() => {
    setLoadingCourse();
    getUserCourseRoles();
  }, []);

  useEffect(() => {
    if (courses.length !== 0) {
      let availableCourses = new Set(
        courses
          .filter(
            (el) =>
              el.role === 'instructor' ||
              el.role === 'staff' ||
              el.role === 'administrator'
          )
          .map((el) => el.course_id)
      );
      setState({
        ...state,
        filtered: [...availableCourses],
      });
    }
  }, [courses]);

  return (
    <Container>
      <Row>
        <Col>
          <h2>Dashboard</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <Collapsible.Advanced className="collapsible-card">
            <Collapsible.Trigger className="collapsible-trigger d-flex">
              <span
                className="flex-grow-1"
                data-testid="AvailableCoursesCollapse"
              >
                Tiempo en Cursos: cursos disponibles
              </span>
              <Collapsible.Visible whenClosed> + </Collapsible.Visible>
              <Collapsible.Visible whenOpen> - </Collapsible.Visible>
            </Collapsible.Trigger>

            <Collapsible.Body className="collapsible-body">
              <ul>
                {loadingCourses ? (
                  <Spinner animation="border" variant="primary" />
                ) : (
                  state.filtered.map((el) => (
                    <li>
                      <Link
                        to={`/course-times/${el}/${getDate(
                          state.today
                        )}/${getDate(state.today)}/`}
                      >
                        Ver {el}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </Collapsible.Body>
          </Collapsible.Advanced>
        </Col>
      </Row>
    </Container>
  );
};

Landing.propTypes = {
  loadingCourses: PropTypes.bool.isRequired,
  courses: PropTypes.array.isRequired,
  getUserCourseRoles: PropTypes.func.isRequired,
  setLoadingCourse: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  loadingCourses: state.course.loading,
  courses: state.course.availableCourses,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getUserCourseRoles,
      setLoadingCourse,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Landing);
