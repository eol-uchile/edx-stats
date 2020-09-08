import React from 'react';
import { Route, Switch } from 'react-router';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { TimeLanding, TimeTable } from './times';
import { connect } from 'react-redux';

const Routes = ({ redirect }) => {
  if (redirect) {
    return (
      <main>
        <Container>
          <Row>
            <Col>Por favor inicia sesi&oacute;n</Col>
          </Row>
        </Container>
      </main>
    );
  }
  return (
    <main>
      <Container>
        <Row>
          <Col className="col-xs-12 col-sm-3 col-md-2">
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
          <Col className="col-xs-12 col-sm-9 col-md-10">
            <Switch>
              <Route exact path="/" component={TimeLanding} />
              <Route
                path={['/course-times/:course_url', '/course-times']}
                component={TimeTable}
              />
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
};

const mapStateToProps = (state) => ({ redirect: state.auth.doLogin });

export default connect(mapStateToProps, null)(Routes);
