import React from 'react';
import { Container, Row, Col, Breadcrumb } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faChevronRight,
  faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';
import { getMyCourses, getHasCourses } from './data/selectors';
import { Spinner, Form, Button, Alert, Card } from '@edx/paragon';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useExplorer } from './hooks';
import Select from 'react-select';

const getDate = (d) => {
  let date = new Date(d);
  let dd = String(date.getDate()).padStart(2, '0');
  let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

const formatGroupLabel = (data) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <span>{data.label}</span>
    <span
      style={{
        backgroundColor: '#EBECF0',
        borderRadius: '2em',
        color: '#172B4D',
        display: 'inline-block',
        fontSize: 12,
        fontWeight: 'normal',
        lineHeight: '1',
        minWidth: 1,
        padding: '0.16666666666667em 0.5em',
        textAlign: 'center',
      }}
    >
      {data.options.length}
    </span>
  </div>
);

/**
 * Landing Page
 *
 * Display courses and links to their stats
 */
const Explorer = (props) => {
  const coursesState = useSelector((state) => state.course.status);
  const loadingCoursesErrors = useSelector((state) => state.course.errors);
  const hasCourses = useSelector((state) => getHasCourses(state));
  const myCourses = useSelector((state) => getMyCourses(state));
  const lms = useSelector((state) => state.urls.lms);

  const [state, setState] = useExplorer(props.match, myCourses);

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
      <Helmet>
        <title>Analítica EOL</title>
      </Helmet>
      <Row>
        <Col>
          <Breadcrumb className="eol-breadcrumb">
            <Breadcrumb.Item href="#" active>
              <FontAwesomeIcon icon={faHome} /> General
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
        <Col md="6">
          <h2 className="content-header">Estad&iacute;sticas por curso</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <p>
            Para ver estad&iacute;sticas de tus cursos selecciona un curso en el
            buscador.
          </p>
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
              <Form.Label>
                <b>Mis cursos</b>
              </Form.Label>
              <Select
                placeholder="Busca un curso..."
                options={state.multiGroup}
                value={
                  // Sets default state when coming back to Landing
                  state.selected !== -1
                    ? state.filtered[state.selected]
                    : undefined
                }
                formatGroupLabel={formatGroupLabel}
                noOptionsMessage={() => 'No hay cursos'}
                data-testid="courses-select"
                inputId="courses-select"
                onChange={(e) =>
                  setState({ ...state, selected: e.value, interacted: true })
                }
              />
            </Form.Group>
            {state.multiGroup.length == 0 && (
              <p style={{ textAlign: 'center', lineHeight: '200px' }}>
                Cargando cursos ...{' '}
                <Spinner animation="border" variant="primary" />
              </p>
            )}
          </Col>
        )}
      </Row>
      {state.selected !== -1 && data !== null && (
        <>
          <Row>
            <Col id="functionalities">
              <h4>Consultar Analítica</h4>
              <ul className="list-group-eol">
                {/* <li>
                  <span className="toggle-arrow">
                    <FontAwesomeIcon icon={faChevronRight} />
                  </span>
                  <Link to={`/courses/${key}/times/${start}/${end}`}>
                    Ver estadísticas generales{' '}
                    <FontAwesomeIcon
                      icon={faExternalLinkAlt}
                      className="float-right"
                    />
                  </Link>
                </li> */}
                <li>
                  <span className="toggle-arrow">
                    <FontAwesomeIcon icon={faChevronRight} />
                  </span>
                  <Link to={`/courses/${key}/times/${start}/${end}`}>
                    Ver tiempo de vizualización general{' '}
                    <FontAwesomeIcon
                      icon={faExternalLinkAlt}
                      className="float-right"
                    />
                  </Link>
                </li>
                <li>
                  <span className="toggle-arrow">
                    <FontAwesomeIcon icon={faChevronRight} />
                  </span>
                  <Link to={`/courses/${key}/visits/${start}/${end}`}>
                    Ver visitas por contenido{' '}
                    <FontAwesomeIcon
                      icon={faExternalLinkAlt}
                      className="float-right"
                    />
                  </Link>
                </li>
              </ul>
            </Col>
          </Row>
          <Row style={{ marginBottom: '1rem' }}>
            <Col md={6} lg={4}>
              <Card>
                <Card.Body>
                  <Card.Title>{data.name}</Card.Title>
                  {data.short_description !== null && (
                    <Card.Text>
                      {data.short_description.length > 300
                        ? data.short_description.slice(0, 300) + '...'
                        : data.short_description}
                    </Card.Text>
                  )}
                  <Button
                    variant="primary"
                    href={`${lms}/courses/${data.key}/course`}
                  >
                    Ver Curso en EOL
                  </Button>
                </Card.Body>
                <Card.Img variant="bottom" src={data.image.src} alt="" />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

Explorer.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default Explorer;
