import React from 'react';
import { Route, Switch } from 'react-router';
import { Container, Row, Col } from 'react-bootstrap';
import { OverviewLanding, VisitsTable, TimesTable } from './Overview';
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
      <Switch>
        <Route
          path="/courses/:course_id/times/:start/:end"
          component={TimesTable}
        />
        <Route
          path="/courses/:course_id/visits/:start/:end"
          component={VisitsTable}
        />
        <Route path="/courses/:course_id" component={OverviewLanding} />
        <Route path="/courses" component={OverviewLanding} />
        <Route
          render={(props) => (
            <RedirectToFeature
              path="/courses"
              message="Estadísticas generales"
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
