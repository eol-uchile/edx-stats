import React, { useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { courseActions } from '.';

/**
 * Wraps components to provide an initial call to the courses API during testing
 */
const CoursesWrapper = ({ initCourses, render, ...props }) => {
  useEffect(() => {
    initCourses();
  }, []);

  return render(props);
};

const mapActionsToProps = (dispatch) =>
  bindActionCreators(
    { initCourses: courseActions.initCourseRolesInfo },
    dispatch
  );

export default connect(null, mapActionsToProps)(CoursesWrapper);
