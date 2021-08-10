import React from 'react';
import { Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

const getDate = (d) => {
  let date = new Date(d);
  let dd = String(date.getDate()).padStart(2, '0');
  let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

const Menu = ({data}) => {
  const key = data ? data.key : null;
  const start = data ? getDate(data.start) : null;
  const end = data ? getDate(data.end) : null;

  return (
    <Row>
      <Col>
        <ListGroup style={{ margin: '0.5rem 0' }}>
          <ListGroupItem style={{ backgroundColor: '#f2f2f2' }}>
            <h4>Consultar Analítica</h4>
          </ListGroupItem>
          <ListGroupItem>
            <Link to={`/courses/${key}/times/${start}/${end}`}>
              Ver tiempo de visualización general{' '}
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

export default Menu;
