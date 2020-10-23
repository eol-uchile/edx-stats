import React from 'react';
import { Route, Switch } from 'react-router';
import { Container, Row, Col } from 'react-bootstrap';
import { TimeLanding } from './times';
import { RedirectToFeature } from './Redirect';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

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
          <Col>
            <h4>Sistema de estad&iacute;stica y an&aacute;lisis</h4>
          </Col>
        </Row>
      </Container>
      <Switch>
        <Route path="/times" component={TimeLanding} />
        <Route
          render={(props) => (
            <RedirectToFeature
              path="/times"
              message="Tiempo de Visita por módulos"
            />
          )}
        />
      </Switch>
    </main>
  );
};

Routes.propTypes = {
  redirect: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({ redirect: state.auth.doLogin });

export default connect(mapStateToProps, null)(Routes);
