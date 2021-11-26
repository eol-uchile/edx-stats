import React from 'react';
import { Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { parseStringToYMDDate as getDate } from '../../helpers';
import PropTypes from 'prop-types';

const Menu = ({ url }) => {
  const key = url ? url.key : null;
  const start = url ? getDate(url.start) : null;
  const end = url ? getDate(url.end) : null;

  return (
    <Row id="analitica-menu">
      <Col>
        <ListGroup style={{ margin: '0.5rem 0' }}>
          <ListGroupItem style={{ backgroundColor: '#f2f2f2' }}>
            <h4>Consultar Analítica</h4>
          </ListGroupItem>
          <ListGroupItem>
            <Link to={`/courses/${key}/times/${start}/${end}`}>
              Ver tiempo de visualizaci&oacute;n general{' '}
              <FontAwesomeIcon
                icon={faExternalLinkAlt}
                className="float-right"
              />
            </Link>
            <p>Revisa donde los usuarios pasaron más tiempo en tu curso</p>
          </ListGroupItem>
          <ListGroupItem>
            <Link to={`/courses/${key}/visits/${start}/${end}`}>
              Ver visitas por contenido{' '}
              <FontAwesomeIcon
                icon={faExternalLinkAlt}
                className="float-right"
              />
            </Link>
            <p>Monitorea que se está viendo y cuando</p>
          </ListGroupItem>
          <ListGroupItem>
            <Link to={`/courses/${key}/videos`}>
              Ver actividad por videos{' '}
              <FontAwesomeIcon
                icon={faExternalLinkAlt}
                className="float-right"
              />
            </Link>
            <p>Observa como los estudiantes ven tus videos</p>
          </ListGroupItem>
        </ListGroup>
      </Col>
    </Row>
  );
};

Menu.propTypes = {
  url: PropTypes.shape({
    key: PropTypes.string.isRequired,
    start: PropTypes.string.isRequired,
    end: PropTypes.string.isRequired,
  }),
};

export default Menu;
