import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router';
import { Container, Row, Col, Spinner } from 'react-bootstrap';

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
          Redirigiendo a {message} ...{' '}
          <Spinner animation="border" variant="primary" />
        </Col>
      </Row>
    </Container>
  );
};

export default RedirectToFeature;
