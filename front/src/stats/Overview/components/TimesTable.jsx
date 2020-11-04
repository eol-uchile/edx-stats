import React, { useEffect, useState, useMemo, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Spinner,
  Alert,
  InputGroup,
  Container,
  Breadcrumb,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Button, CheckBox, Input } from '@edx/paragon';
import { Helmet } from 'react-helmet';
import {
  recoverCourseStudentTimesSum,
  recoverCourseStructure,
  setLoadingCourse,
  setLoadingTimes,
  resetCourses,
  resetTimes,
} from '../data/actions';
import { AsyncCSVButton, TableChapter, TableVertical } from '.';
import './TableandChart.css';

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
    current: match.params.course_id ? match.params.course_id : '',
    lowerDate: match.params.start ? match.params.start : '',
    upperDate: match.params.end ? match.params.end : '',
  });

  const [tableData, setTableData] = useState({
    loaded: false,
    chapters: [],
    sequentials: [],
    verticals: [],
    mapping: [], // Vertical_ids to column index
    all: 0, // Column counter
    useChapters: true,
    course_info: {},
  });

  const [rowData, setRowData] = useState({
    all: [],
    chapters: [],
    useChapters: true,
  });

  const [errors, setErrors] = useState([]);

  // Load data when the button trigers
  const submit = () => {
    if (searchState.current !== '') {
      if (searchState.lowerDate === '' && searchState.upperDate === '') {
        setErrors([...errors, 'Por favor ingrese fechas válidas']);
      } else {
        setLoadingCourse();
        setTableData({ ...tableData, loaded: false });
        recoverCourseStructure(searchState.current);
        setErrors([]);
      }
    }
  };

  // Reset on Unmount
  useEffect(() => {
    return () => {
      resetTimes();
      resetCourses();
    };
  }, []);

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
            }.${key_seq + 1}`}</th>
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
        useChapters: true,
      });

      // Load times for users
      recoverCourseStudentTimesSum(
        current.id,
        new Date(searchState.lowerDate),
        new Date(searchState.upperDate)
      );
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
        rows.push([u, ...values.map((v) => v)]);
        // Put each sub sum for each chapter
        let chapterRow = [u];
        subtotalsIndex.forEach((st, k) => {
          let leftIndex = subtotalsIndex[k - 1] ? subtotalsIndex[k - 1] : 0;
          let subArray = values.slice(leftIndex, st);
          chapterRow.push(subArray.reduce(add, 0));
        });
        chapters.push(chapterRow);
      });
      setRowData({ all: rows, useChapters: true, chapters: chapters });
      setErrors([]);
    }
  }, [tableData.loaded, times.added_times]);

  // Copy errors to local state
  useEffect(() => {
    if (course.errors.length > 0 || times.errors.length > 0) {
      setErrors([...errors, ...course.errors, ...times.errors]);
    }
  }, [course.errors, times.errors]);

  const toggleChapters = (checked) => {
    setTableData({ ...tableData, useChapters: checked });
    setRowData({ ...rowData, useChapters: checked });
  };

  const removeErrors = (msg) => {
    let newErrors = errors.filter((el) => msg !== el);
    setErrors(newErrors);
  };

  const rowDataTimes = useMemo(
    () => ({
      all: rowData.all.map((r) => [
        r[0],
        ...r.slice(1).map((el) => parseFloatToTimeString(el)),
      ]),
      chapters: rowData.chapters.map((r) => [
        r[0],
        ...r.slice(1).map((el) => parseFloatToTimeString(el)),
      ]),
    }),
    [rowData]
  );

  const tableCaption = 'Tiempos de visita por unidad';

  return (
    <Container>
      <Helmet>
        <title>
          Tiempos por módulos
          {!course.loading & tableData.loaded
            ? `: ${course.course[0].name}`
            : ''}
        </title>
      </Helmet>
      <Row>
        <Col>
          <Breadcrumb>
            <Link className="breadcrumb-item" to="/modules">
              General
            </Link>
            <Breadcrumb.Item
              href="#"
              active
            >{`Tiempos ${searchState.current}`}</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Tiempo de visita de estudiantes por Módulo</h2>
          <p>
            Este curso tiene fechas de inicio{' '}
            {new Date(searchState.lowerDate).toLocaleDateString('es-ES')} y de
            término{' '}
            {new Date(searchState.upperDate).toLocaleDateString('es-ES')}.
            También se puede buscar fuera de estos límites de tiempo.
          </p>
        </Col>
      </Row>
      <Row style={{ marginBottom: '1rem' }}>
        <Col className="col-xs-12 col-sm-12 col-md-4">
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Fecha de Inicio</InputGroup.Text>
            </InputGroup.Prepend>
            <Input
              id="times-lDate"
              data-testid="times-lDate"
              type="date"
              value={searchState.lowerDate}
              onChange={(e) =>
                setSearchState({ ...searchState, lowerDate: e.target.value })
              }
            />
          </InputGroup>
        </Col>
        <Col className="col-xs-12 col-sm-12 col-md-4">
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Fecha de Fin</InputGroup.Text>
            </InputGroup.Prepend>
            <Input
              id="times-uDate"
              data-testid="times-uDate"
              type="date"
              value={searchState.upperDate}
              onChange={(e) =>
                setSearchState({ ...searchState, upperDate: e.target.value })
              }
            />
          </InputGroup>
        </Col>
        <Col className="col-xs-12 col-sm-12 col-md-4">
          <Button variant="success" onClick={submit} block>
            Buscar
          </Button>
        </Col>
      </Row>
      {course.loading && !tableData.loaded ? (
        <Row>
          <Col style={{ textAlign: 'center' }}>
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
                checked={tableData.useChapters}
                onClick={(e) => {
                  toggleChapters(e.target.checked);
                }}
              />
            </Col>
          </Row>
          <Row style={{ marginTop: '1em' }}>
            <Col>
              <h4>Curso: {course.course[0].name}</h4>
            </Col>
          </Row>
          <Row>
            <Col>
              {errors.length !== 0
                ? errors.map((e, k) => (
                    <Alert
                      variant="warning"
                      key={k}
                      dismissible
                      onClick={() => removeErrors(e)}
                    >
                      {e}
                    </Alert>
                  ))
                : null}
            </Col>
          </Row>
          {tableData.useChapters ? (
            <TableChapter
              title={course.course[0].name}
              headers={tableData}
              data={rowDataTimes.chapters}
              caption={tableCaption}
              errors={errors}
            />
          ) : (
            <TableVertical
              title={course.course[0].name}
              headers={tableData}
              data={rowDataTimes.all}
              caption={tableCaption}
              errors={errors}
            />
          )}
        </Fragment>
      ) : (
        <Row>
          <Col>
            {errors.length !== 0 &&
              errors.map((e, k) => (
                <Alert
                  variant="warning"
                  key={k}
                  dismissible
                  onClick={() => removeErrors(e)}
                >
                  {e}
                </Alert>
              ))}
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
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(TimesTable);
