import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router';
import { Container, Row, Col } from 'react-bootstrap';
import { Explorer, VisitsTable, TimesTable, Overview } from './Courses';
import { RedirectToFeature } from './Redirect';
import { useDispatch, useSelector } from 'react-redux';
import { courseActions, PullUp } from './Courses';

/**
 * Application routes for analytics
 *
 * Since most features require we have courses loaded and permissions too
 * we set the initial Effect at top level
 */
const Routes = () => {
  const redirect = useSelector((state) => state.auth.doLogin);
  const coursesState = useSelector((state) => state.course.status);
  const dispatch = useDispatch();

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
      dispatch(courseActions.initCourseRolesInfo());
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
          <Route path="/search" component={Explorer} />
          <Route
            render={(props) => (
              <RedirectToFeature
                {...props}
                path="/search"
                message="Explorador de cursos"
              />
            )}
          />
        </Switch>
        <PullUp />
      </section>
    </main>
  );
};

export default Routes;
