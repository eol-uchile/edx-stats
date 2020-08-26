import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { Table, Input, Button } from '@edx/paragon';
import {
  recoverCourseStudentTimes,
  recoverCourseStructure,
  setLoadingCourse,
  setLoadingTimes,
} from './data/actions';

const TimesTable = ({
  course,
  times,
  recoverCourseStructure,
  recoverCourseStudentTimes,
  setLoadingCourse,
  setLoadingTimes,
}) => {
  const [courseState, setCourseState] = useState(
    'block-v1:UChile+LEIT01+2020_T2+type@courseState+block@course',
  );

  // Initial data load
  useEffect(() => {
    if (!course.loading) {
      recoverCourseStructure(courseState);
    }
  }, []);

  return (
    <Container fluid>
      <Row>
        <Col>
          <h3>Cargar tiempo por cursos módulos</h3>
          <Input
            type="text"
            defaultValue="Buscar nombre o código de curso"
            onChange={(e) => setCourseState(e.target.value)}
          />
          <Button className="btn-primary" onClick={() => setLoadingCourse()}>
            Cargar
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          {course.loading ? (
            <Spinner animation="border" variant="primary" />
          ) : (
            <Table
              data={[
                {
                  name: 'Lil Bub',
                  color: 'brown tabby',
                  famous_for: 'weird tongue',
                },
                {
                  name: 'Grumpy Cat',
                  color: 'siamese',
                  famous_for: 'serving moods',
                },
                {
                  name: 'Smoothie',
                  color: 'orange tabby',
                  famous_for: 'modeling',
                },
                {
                  name: 'Maru',
                  color: 'brown tabby',
                  famous_for: 'being a lovable oaf',
                },
                {
                  name: 'Keyboard Cat',
                  color: 'orange tabby',
                  famous_for: 'piano virtuoso',
                },
                {
                  name: 'Long Cat',
                  color: 'russian white',
                  famous_for:
                    'being loooooooooooooooooooooooooooooooooooooooooooooooooooooong',
                },
              ]}
              columns={[
                {
                  label: 'Name',
                  key: 'name',
                  columnSortable: true,
                  onSort: () => {},
                  width: 'col-3',
                },
                {
                  label: 'Famous For',
                  key: 'famous_for',
                  columnSortable: false,
                  onSort: () => {},
                  width: 'col-6',
                },
                {
                  label: 'Coat Color',
                  key: 'color',
                  columnSortable: false,
                  hideHeader: true,
                  onSort: () => {},
                  width: 'col-3',
                },
              ]}
              caption="Famous Internet Cats"
              className="table-responsive"
            />
          )}
        </Col>
        |
      </Row>
    </Container>
  );
};

TimesTable.propTypes = {
  course: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  times: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  recoverCourseStructure: PropTypes.func.isRequired,
  recoverCourseStudentTimes: PropTypes.func.isRequired,
  setLoadingCourse: PropTypes.func.isRequired,
  setLoadingTimes: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  course: state.course,
  times: state.times,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      recoverCourseStructure,
      recoverCourseStudentTimes,
      setLoadingCourse,
      setLoadingTimes,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(TimesTable);
