import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

const RedirectToFeature = ({ path, message }) => {
  const [state, setState] = useState(false);

  // Set timeout on mount
  useEffect(() => {
    setTimeout(() => setState(true), 2000);
  }, []);

  if (state) {
    return <Redirect push to={path} />;
  }

  return (
    <Container>
      <Row>
        <Col>
          <h5>Sistema de estad&iacute;stica y an&aacute;lisis</h5>
        </Col>
      </Row>
      <Row>
        <Col>
          Redirigiendo a {message} ...{' '}
          <Spinner animation="border" variant="primary" />
        </Col>
      </Row>
    </Container>
  );
};

RedirectToFeature.propTypes = {
  path: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};

export default RedirectToFeature;
