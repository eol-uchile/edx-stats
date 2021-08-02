import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

const Menu = () => (
  <>
    {' '}
    <ListGroup style={{ margin: '0.5rem 0' }}>
      <ListGroupItem style={{ backgroundColor: '#f2f2f2' }}>
        <h4>Consultar Analítica</h4>
      </ListGroupItem>
      <ListGroupItem>
        <Link to={`/courses/${'curso'}/times/${'start'}/${'end'}`}>
          Ver tiempo de vizualización general{' '}
          <FontAwesomeIcon icon={faExternalLinkAlt} className="float-right" />
        </Link>
        <p>Revisa donde los usuarios pasaron más tiempo en tu curso</p>
      </ListGroupItem>
      <ListGroupItem>
        <Link to={`/courses/${'curso'}/visits/${'start'}/${'end'}`}>
          Ver visitas por contenido{' '}
          <FontAwesomeIcon icon={faExternalLinkAlt} className="float-right" />
        </Link>
        <p>Monitorea que se está viendo y cuando</p>
      </ListGroupItem>
      <ListGroupItem>
        <a href="">
          Ver actividad por videos (Próximamente){' '}
          <FontAwesomeIcon icon={faExternalLinkAlt} className="float-right" />
        </a>
        <p>Observa como los estudiantes ven tus videos</p>
      </ListGroupItem>
    </ListGroup>{' '}
  </>
);

export default Menu;
