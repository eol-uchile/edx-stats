import React from 'react';
import {
  Container,
  Row,
  Col,
  Breadcrumb,
  ListGroup,
  ListGroupItem,
} from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { course, actions } from './data/actions';
import { getMyCourses, getHasCourses } from './data/selectors';
import { Spinner, Form, Button, Alert, Card } from '@edx/paragon';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useLanding } from './hooks';

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
 * Display courses and links to their stats
 */
const Landing = ({
  coursesState,
  loadingCoursesErrors,
  hasCourses,
  myCourses,
  lms,
  selectedCache,
  initCourses,
  setSelectedCourse,
}) => {
  const [state, setState] = useLanding(
    coursesState,
    myCourses,
    selectedCache,
    initCourses,
    setSelectedCourse
  );

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
          <Breadcrumb className="eol-breadcrumb">
            <Breadcrumb.Item href="#" active>
              General
            </Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Row>
        <Col>
          <h4>Sistema de estad&iacute;stica y an&aacute;lisis</h4>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Estad&iacute;sticas por curso</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <p>Ver estad&iacute;sticas para tus cursos.</p>
        </Col>
      </Row>
      <Row>
        {coursesState === 'loading' ? (
          <Col style={{ textAlign: 'center', lineHeight: '200px' }}>
            Cargando cursos <Spinner animation="border" variant="primary" />
          </Col>
        ) : coursesState === 'failed' ? (
          <Col style={{ textAlign: 'center' }}>
            {loadingCoursesErrors.map((err, k) => (
              <Alert key={k} variant="warning">
                {err}
              </Alert>
            ))}
          </Col>
        ) : !hasCourses ? (
          <Col>
            <Alert variant="warning">No hay cursos disponibles</Alert>
          </Col>
        ) : (
          <Col>
            <Form.Group isValid={state.selected !== -1}>
              <Form.Label>Mis cursos</Form.Label>
              <Form.Control
                as="select"
                floatingLabel="Seleccione un curso"
                data-testid="courses-select"
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
              </Form.Control>
            </Form.Group>
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
                <h4>Consultar</h4>
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
  coursesState: PropTypes.string.isRequired,
  loadingCoursesErrors: PropTypes.array.isRequired,
  hasCourses: PropTypes.bool.isRequired,
  myCourses: PropTypes.array.isRequired,
  lms: PropTypes.string,
  selectedCache: PropTypes.string,
  initCourses: PropTypes.func.isRequired,
  setSelectedCourse: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  coursesState: state.course.status,
  loadingCoursesErrors: state.course.errors,
  hasCourses: getHasCourses(state),
  myCourses: getMyCourses(state),
  selectedCache: state.dashboard.selected,
  lms: state.urls.lms,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      initCourses: course.initCourseRolesInfo,
      setSelectedCourse: actions.setSelectedCourse,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Landing);
