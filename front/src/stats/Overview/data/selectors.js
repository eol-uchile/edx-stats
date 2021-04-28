import { createSelector } from 'reselect';

/* SELECTORS */
const getCourseInfo = (state) => state.course.course_info.data;
const getCourseEnrolledData = (state) => state.course.courses_enrolled;

/**
 * Merge course info and course roles to recover my courses
 */
const getMyCourses = createSelector(
  [getCourseEnrolledData, getCourseInfo],
  (course_enrolled, course_info) => {
    let my_courses = {};
    course_enrolled.forEach((course) => {
      my_courses[course.course_id] = course.roles;
    });
    let filtered_courses = course_info.filter(
      (course) => course.key in my_courses
    );
    let merged_courses = filtered_courses.map((course) => ({
      ...course,
      roles: my_courses[course.key],
    }));
    let today = new Date();
    merged_courses.forEach((course) => {
      course['end'] = course['end'] === null ? today : course['end'];
    });
    return merged_courses;
  }
);

const getHasCourses = (state) =>
  state.course.courses_enrolled.length > 0 && state.course.status === 'success';

export { getMyCourses, getHasCourses };
