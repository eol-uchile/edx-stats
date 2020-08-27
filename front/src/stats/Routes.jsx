import React from 'react';
import { Route, Switch } from 'react-router';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { TimeLanding, TimeTable } from './times';

export default function Routes() {
  return (
    <main>
      <Container>
        <Row>
          <Col className="col-sm-2">
            <Link to="/">Dashboard</Link>
            <br />
            <br />
            <Link to="/course-times">Tiempo por curso</Link>
            <br />
            <br />
            <Link to="/course-videos">Videos por curso</Link>
            <br />
            <br />
          </Col>
          <Col className="col-sm-10">
            <Switch>
              <Route exact path="/" component={TimeLanding} />
              <Route path="/course-times" component={TimeTable} />
              <Route
                path="/course-videos"
                component={() => <div>Videos search and analysis...</div>}
              />
            </Switch>
          </Col>
        </Row>
      </Container>
    </main>
  );
}
