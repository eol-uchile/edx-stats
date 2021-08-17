import React from 'react';
import { Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const getDate = (d) => {
  let date = new Date(d);
  let dd = String(date.getDate()).padStart(2, '0');
  let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

const Menu = ({ url }) => {
  const key = url ? url.key : null;
  const start = url ? getDate(url.start) : null;
  const end = url ? getDate(url.end) : null;

  return (
    <Row>
      <Col>
        <ListGroup style={{ margin: '0.5rem 0' }}>
          <ListGroupItem style={{ backgroundColor: '#f2f2f2' }}>
            <h4>Consultar Analítica</h4>
          </ListGroupItem>
          <ListGroupItem>
            <Link to={`/search/${key}/times/${start}/${end}`}>
              Ver tiempo de visualizaci&oacute;n general{' '}
              <FontAwesomeIcon
                icon={faExternalLinkAlt}
                className="float-right"
              />
            </Link>
            <p>Revisa donde los usuarios pasaron más tiempo en tu curso</p>
          </ListGroupItem>
          <ListGroupItem>
            <Link to={`/search/${key}/visits/${start}/${end}`}>
              Ver visitas por contenido{' '}
              <FontAwesomeIcon
                icon={faExternalLinkAlt}
                className="float-right"
              />
            </Link>
            <p>Monitorea que se está viendo y cuando</p>
          </ListGroupItem>
          <ListGroupItem disabled>
            <a href="">
              Ver actividad por videos (Próximamente){' '}
              <FontAwesomeIcon
                icon={faExternalLinkAlt}
                className="float-right"
              />
            </a>
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
