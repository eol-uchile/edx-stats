import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Spinner,
  ListGroup,
  ListGroupItem,
} from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  getUserCourseRoles,
  setLoadingCourse,
  getEnrolledCourses,
} from './data/actions';
import { selectMyCourses } from './data/reducers';
import { InputSelect, Button, Card } from '@edx/paragon';
import { Link } from 'react-router-dom';
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
  myCourses,
  getUserCourseRoles,
  getEnrolledCourses,
  setLoadingCourse,
  lms,
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
            <b>instructor</b> o <b>administrador</b>.
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
        <Row style={{ marginBottom: '1rem' }}>
          <Col md={4}>
            <Card>
              <Card.Body>
                <Card.Title>{data.name}</Card.Title>
                <Card.Text>{data.short_description}</Card.Text>
                <Button
                  variant="primary"
                  href={`${lms}/courses/${data.id}/course`}
                >
                  Ver Curso
                </Button>
              </Card.Body>
              <Card.Img variant="bottom" src={data.media.image.small} alt="" />
            </Card>
          </Col>
          <Col md={8}>
            <ListGroup>
              <ListGroupItem>
                <h5>Consultar</h5>
              </ListGroupItem>
              <ListGroupItem>
                <Link to={`/modules/times/${id}/${start}/${end}`}>
                  Ver tiempo de visita por contenido
                </Link>
              </ListGroupItem>
              <ListGroupItem>
                <Link to={`/modules/visits/${id}/${start}/${end}`}>
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
  myCourses: PropTypes.array.isRequired,
  getUserCourseRoles: PropTypes.func.isRequired,
  getEnrolledCourses: PropTypes.func.isRequired,
  setLoadingCourse: PropTypes.func.isRequired,
  lms: PropTypes.string,
};

const mapStateToProps = (state) => ({
  loadingCourses: state.course.course_roles.loading,
  loadingEnrolled: state.course.courses_enrolled.loading,
  myCourses: selectMyCourses(state),
  lms: state.urls.lms,
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
