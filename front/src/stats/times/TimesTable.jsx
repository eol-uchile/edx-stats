import React, { useEffect, useState, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Container,
  Row,
  Col,
  Spinner,
  Table,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSearch } from '@fortawesome/free-solid-svg-icons';
import { SearchField, Collapsible, CheckBox } from '@edx/paragon';
import { Helmet } from 'react-helmet';
import {
  recoverCourseStudentTimesSum,
  recoverCourseStructure,
  setLoadingCourse,
  setLoadingTimes,
  resetCourses,
  resetTimes,
} from './data/actions';
import AsyncCSVButton from './ExportCsv';
import { matchPath } from 'react-router';

const add = (a, b) => a + b;

const parseFloatToTimeString = (seconds) => {
  let secs = `${seconds % 60}`;
  let mins = `${Math.floor(seconds / 60) % 60}`;
  let hours = Math.floor(seconds / 3600);
  if (hours > 0) {
    return `${hours}:${mins.length === 1 ? '0' + mins : mins}:${
      secs.length === 1 ? '0' + secs : secs
    }`;
  }
  return `${mins.length === 1 ? '0' + mins : mins}:${
    secs.length === 1 ? '0' + secs : secs
  }`;
};

const parseToTableRows = (r, k) => (
  <tr key={'row' + k}>
    {r.map((d, kd) => (
      <td key={kd}>{d}</td>
    ))}
  </tr>
);

/**
 * TimesTable
 *
 * Search and display the student spent time on a course.
 * The course can be provided by the URL, the
 *
 * @param {Object} course
 * @param {Object} times
 * @param {Function} recoverCourseStructure
 * @param {Function} recoverCourseStudentTimesSum
 * @param {Function} setLoadingCourse
 * @param {Function} resetCourses
 * @param {Function} resetTimes
 * @param {Object} location
 */
const TimesTable = ({
  course,
  times,
  recoverCourseStructure,
  recoverCourseStudentTimesSum,
  setLoadingCourse,
  resetCourses,
  resetTimes,
  match,
}) => {
  const [searchState, setSearchState] = useState({
    current: match.params.course_url ? match.params.course_url : '',
  });

  const [tableData, setTableData] = useState({
    loaded: false,
    chapters: [],
    sequentials: [],
    verticals: [],
    mapping: [], // Vertical_ids to column index
    all: 0, // Column counter
    useChapters: false,
  });

  const [rowData, setRowData] = useState({
    all: [],
    chapters: [],
    useChapters: false,
  });

  // Cleanup on change view
  useEffect(() => {
    return () => {
      resetCourses();
      resetTimes();
    };
  }, []);

  // Load data when the button trigers
  useEffect(() => {
    if (searchState.current !== '') {
      recoverCourseStructure(searchState.current);
    }
    // eslint-disable-next-line
  }, [searchState.current]);

  // Recover incoming data for table
  useEffect(() => {
    if (course.course.length !== 0) {
      let current = course.course[0];
      // Get all the numbers
      let chapters = [];
      let sequentials = [];
      let verticals = [];
      let mapping = {};
      let all = 0;
      current.chapters.forEach((ch, key_ch) => {
        let subtotal = 0;
        ch.sequentials.forEach((seq, key_seq) => {
          seq.verticals.forEach((vert, key_vert) => {
            verticals.push({
              id: vert.vertical_id,
              val: `${key_ch + 1}.${key_seq + 1}.${key_vert + 1}`,
              tooltip: vert.name,
            });
            // Store array position id for row mapping
            mapping[vert.vertical_id] = all;
            all += 1;
          });
          subtotal += seq.verticals.length;
          sequentials.push(
            <th colSpan={seq.verticals.length} scope="col" key={seq.name}>{`${
              key_ch + 1
            }.${key_seq + 1}`}</th>,
          );
        });
        chapters.push({ name: ch.name, subtotal });
      });

      setTableData({
        loaded: true,
        chapters,
        sequentials,
        verticals,
        mapping,
        all,
        useChapters: false,
      });

      // Load times for users
      recoverCourseStudentTimesSum(current.id);
    }
    // eslint-disable-next-line
  }, [course.course]);

  // Parse times as rows
  useEffect(() => {
    if (tableData.loaded && times.added_times.length !== 0) {
      let rows = [];
      let users = {};
      let chapters = [];
      // Group by username
      times.added_times.map((t) => {
        if (t.username in users) {
          users[t.username].push(t);
        } else {
          users[t.username] = [t];
        }
      });

      // Get chapters length
      let subtotalsIndex = [];
      tableData.chapters.forEach((el, k) => {
        let sum = el.subtotal;
        if (subtotalsIndex[k - 1]) {
          sum = sum + subtotalsIndex[k - 1];
        }
        subtotalsIndex.push(sum);
      });

      // Map Rows with verticals
      Object.keys(users).forEach((u) => {
        // Fill array with zeros
        let values = Array.from(Array(tableData.all), () => 0);
        // Fill positions with delta time
        for (let index = 0; index < users[u].length; index++) {
          if (
            tableData.mapping[users[u][index].event_type_vertical] !== undefined
          ) {
            values[index] = users[u][index].total;
          }
        }
        // Put rows for all
        rows.push([u, ...values.map((v) => parseFloatToTimeString(v))]);
        // Put each sub sum for each chapter
        let chapterRow = [u];
        subtotalsIndex.forEach((st, k) => {
          let leftIndex = subtotalsIndex[k - 1] ? subtotalsIndex[k - 1] : 0;
          let subArray = values.slice(leftIndex, st);
          chapterRow.push(parseFloatToTimeString(subArray.reduce(add, 0)));
        });
        chapters.push(chapterRow);
      });
      setRowData({ all: rows, useChapters: false, chapters: chapters });
    }
  }, [tableData.loaded, times.added_times]);

  const toggleChapters = (checked) => {
    setTableData({ ...tableData, useChapters: checked });
    setRowData({ ...rowData, useChapters: checked });
  };

  return (
    <Container fluid>
      <Helmet>
        <title>
          Tiempos por módulos
          {!course.loading & tableData.loaded
            ? `: ${course.course[0].name}`
            : ''}
        </title>
      </Helmet>
      <Row style={{ marginBottom: '2em' }}>
        <Col>
          <h3>Cargar tiempo por módulos</h3>
          <SearchField
            onSubmit={(value) => {
              if (searchState.current !== value) {
                setSearchState({ ...searchState, current: value });
                setTableData({ ...tableData, loaded: false });
                setLoadingCourse();
              }
            }}
            inputLabel={'Cursos:'}
            icons={{
              submit: <FontAwesomeIcon icon={faSearch} />,
              clear: <FontAwesomeIcon icon={faTimes} />,
            }}
          />
        </Col>
      </Row>

      {course.loading && !tableData.loaded ? (
        <Row>
          <Col>
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      ) : tableData.loaded ? (
        <Fragment>
          <Row>
            <Col>
              <AsyncCSVButton
                text="Descargar Datos"
                headers={
                  tableData.useChapters
                    ? [
                        'Estudiantes',
                        ...tableData.chapters.map((el) => el.name),
                      ]
                    : [
                        'Estudiantes',
                        ...tableData.verticals.map((el) => el.val),
                      ]
                }
                data={rowData.useChapters ? rowData.chapters : rowData.all}
              />
            </Col>
            <Col>
              <CheckBox
                name="checkbox"
                label="Agrupar Módulos"
                onClick={(e) => {
                  toggleChapters(e.target.checked);
                }}
              />
            </Col>
            <Col>
              <CheckBox
                name="checkbox"
                label="Ver total"
                onClick={(e) => {
                  console.log(e.target.checked);
                }}
              />
            </Col>
          </Row>
          <Row style={{ marginTop: '1em' }}>
            <Col>
              <h4>
                <Collapsible title={course.course[0].name} styling="basic">
                  <p>{course.course[0].id}</p>
                </Collapsible>
              </h4>
              <Table bordered hover size="sm" responsive striped>
                <caption>Tiempos de visita: {course.course[0].name}</caption>
                {tableData.useChapters ? null : (
                  <Fragment>
                    <col />
                    {tableData.chapters.map((el, k) => (
                      <colgroup span={el.subtotal} key={k}></colgroup>
                    ))}
                  </Fragment>
                )}
                <thead>
                  {tableData.useChapters ? (
                    <tr>
                      <th>Estudiantes</th>
                      {tableData.chapters.map((el) => (
                        <th key={el.name}>{el.name}</th>
                      ))}
                    </tr>
                  ) : (
                    <Fragment>
                      <tr>
                        <th rowSpan="3">Estudiantes</th>
                        {tableData.chapters.map((el) => (
                          <th colSpan={el.subtotal} key={el.name}>
                            {el.name}
                          </th>
                        ))}
                      </tr>
                      <tr>{tableData.sequentials}</tr>
                      <tr>
                        {tableData.verticals.map((el) => (
                          <th key={el.id}>
                            <OverlayTrigger
                              key={el.id}
                              placement={'bottom'}
                              overlay={(props) => (
                                <Tooltip id={`tooltip-${el.id}`} {...props}>
                                  {el.tooltip}.
                                </Tooltip>
                              )}
                            >
                              <span>{el.val}</span>
                            </OverlayTrigger>
                          </th>
                        ))}
                      </tr>
                    </Fragment>
                  )}
                </thead>
                <tbody>
                  {rowData.useChapters
                    ? rowData.chapters.map(parseToTableRows)
                    : rowData.all.map(parseToTableRows)}
                  <tr></tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </Fragment>
      ) : (
        <Row>
          <Col>
            <p>No hay datos para el curso</p>
          </Col>
        </Row>
      )}
    </Container>
  );
};

TimesTable.propTypes = {
  course: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  times: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  recoverCourseStructure: PropTypes.func.isRequired,
  recoverCourseStudentTimesSum: PropTypes.func.isRequired,
  setLoadingCourse: PropTypes.func.isRequired,
  setLoadingTimes: PropTypes.func.isRequired,
  resetCourses: PropTypes.func.isRequired,
  resetTimes: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  course: state.course,
  times: state.times,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      recoverCourseStructure,
      recoverCourseStudentTimesSum,
      setLoadingCourse,
      setLoadingTimes,
      resetCourses,
      resetTimes,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(TimesTable);
