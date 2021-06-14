import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router';
import { Container, Row, Col } from 'react-bootstrap';
import { Explorer, VisitsTable, TimesTable, Overview } from './Courses';
import { RedirectToFeature } from './Redirect';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { courseActions } from './Courses';
import PropTypes from 'prop-types';

/**
 * Application routes for analytics
 *
 * Since most features require we have courses loaded and permissions too
 * we set the initial Effect at top level
 */
const Routes = ({ redirect, coursesState, initCourses }) => {
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
  // Load courses globaly to store
  useEffect(() => {
    if (coursesState === 'idle') {
      initCourses();
    }
  }, []);
  return (
    <main>
      <section>
        <Switch>
          <Route
            path="/courses/:course_id/times/:start/:end"
            component={TimesTable}
          />
          <Route
            path="/courses/:course_id/visits/:start/:end"
            component={VisitsTable}
          />
          <Route path="/courses/:course_id" component={Overview} />
          <Route path="/explorer/:course_id" component={Explorer} />
          <Route path="/explorer" component={Explorer} />
          <Route
            render={(props) => (
              <RedirectToFeature
                {...props}
                path="/explorer"
                message="Explorador de cursos"
              />
            )}
          />
        </Switch>
      </section>
    </main>
  );
};

Routes.propTypes = {
  redirect: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  redirect: state.auth.doLogin,
  coursesState: state.course.status,
});

const mapActionsToProps = (dispatch) =>
  bindActionCreators(
    { initCourses: courseActions.initCourseRolesInfo },
    dispatch
  );

export default connect(mapStateToProps, mapActionsToProps)(Routes);
