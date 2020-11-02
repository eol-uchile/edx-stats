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
          path="/modules/times/:course_id/:start/:end"
          component={TimesTable}
        />
        <Route
          path="/modules/visits/:course_id/:start/:end"
          component={VisitsTable}
        />
        <Route path="/modules" component={OverviewLanding} />
        <Route
          render={(props) => (
            <RedirectToFeature
              path="/modules"
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
