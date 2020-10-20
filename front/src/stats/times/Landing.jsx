import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getUserCourseRoles } from './data/actions';
import { Link } from 'react-router-dom';
import { Collapsible } from '@edx/paragon';
import PropTypes from 'prop-types';

const getDate = (d) => {
  let dd = String(d.getDate()).padStart(2, '0');
  let mm = String(d.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = d.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

const Landing = ({ courses, getUserCourseRoles }) => {
  const [state, setState] = useState({
    selected: false,
    filtered: [],
    today: new Date(),
  });

  useEffect(() => {
    getUserCourseRoles();
  }, []);

  useEffect(() => {
    if (courses.length !== 0) {
      setState({
        ...state,
        filtered: courses.filter((el) => el.role === 'instructor'),
      });
    }
  }, [courses]);

  return (
    <Container>
      <Row>
        <Col>Bonito dashboard</Col>
      </Row>
      <Row>
        <Col>
          <Collapsible.Advanced className="collapsible-card">
            <Collapsible.Trigger className="collapsible-trigger d-flex">
              <span
                className="flex-grow-1"
                data-testid="AvailableCoursesCollapse"
              >
                Cursos disponibles
              </span>
              <Collapsible.Visible whenClosed> + </Collapsible.Visible>
              <Collapsible.Visible whenOpen> - </Collapsible.Visible>
            </Collapsible.Trigger>

            <Collapsible.Body className="collapsible-body">
              <ul>
                {state.filtered.map((el) => (
                  <li>
                    <Link
                      to={`/course-times/${el.course_id}/${getDate(
                        state.today
                      )}/${getDate(state.today)}/`}
                    >
                      Ver {el.course_id}
                    </Link>
                  </li>
                ))}
              </ul>
            </Collapsible.Body>
          </Collapsible.Advanced>
        </Col>
      </Row>
    </Container>
  );
};

Landing.propTypes = {
  courses: PropTypes.array.isRequired,
  getUserCourseRoles: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({ courses: state.course.availableCourses });

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ getUserCourseRoles }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Landing);
