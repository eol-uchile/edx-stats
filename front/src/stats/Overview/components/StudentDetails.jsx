import React, { Fragment, useMemo, useCallback, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  Input,
  SearchField,
  ValidationFormGroup,
  TransitionReplace,
} from '@edx/paragon';
import { AsyncCSVButton, TableChapter, TableVertical } from '.';
import { classNameRuling, sortByColumn } from '../helpers';
import PropTypes from 'prop-types';

/**
 * Helper functions
 */

const sum = (agg, item) => agg + item;

const addTotal = (list) => {
  let copy = list.slice(1);
  copy.push(copy.reduce(sum, 0));
  return [list[0], ...copy];
};

/**
 * StudentDetails table emulates a
 * standard Datatable for JQuery.
 *
 * Allows a parsing function for the final displayed values.
 * i.e. from seconds to minutes:seconds
 *
 * Returns Rows with toggles, inputs and tables
 *
 * Developper NOTE: Testing using the animations for table switching
 * was not working so it is disabled by default.
 */
const StudentDetails = ({
  title,
  rowData,
  tableData,
  caption = 'Detalle por estudiante',
  parseFunction = (e) => e,
  doTotal = false,
  doAnimation = false,
}) => {
  const [state, setState] = useState({
    useChaptersTable: true,
    student: '',
    sort: 0,
    reverse: false,
    coloring: false,
  });

  const toggleChapters = (checked, key) => {
    setState({ ...state, [key]: checked });
  };

  const searchStudent = (value) => {
    setState({ ...state, student: value.toLowerCase() });
  };

  const sortHeader = (i, r) => setState({ ...state, sort: i, reverse: r });

  const coloringFunction = useCallback(() => {
    // Find max overall (without sums)
    var maxAll = -1;
    rowData.all.forEach((row) =>
      row.slice(1).forEach((el) => {
        maxAll = maxAll > el ? maxAll : el;
      })
    );
    // Asume min is zero
    // Split into 3
    var step = maxAll / 3;
    return (d) => classNameRuling(d, 0, step, step * 2);
  }, [rowData, classNameRuling]);

  const dataSet = useMemo(() => {
    if (!doTotal) {
      return rowData;
    }
    return {
      all: rowData.all.map(addTotal),
      chapters: rowData.chapters.map(addTotal),
    };
  }, [doTotal, rowData, addTotal]);

  const subSets = useMemo(
    () => ({
      all: dataSet.all.filter((r) =>
        r[0].toLowerCase().includes(state.student)
      ),
      chapters: dataSet.chapters.filter((r) =>
        r[0].toLowerCase().includes(state.student)
      ),
    }),
    [state.student, dataSet]
  );

  const sorted = useMemo(
    () => ({
      all: sortByColumn(subSets.all, state.sort, state.reverse),
      chapters: sortByColumn(subSets.chapters, state.sort, state.reverse),
    }),
    [state.sort, state.reverse, subSets, sortByColumn]
  );

  const table = state.useChaptersTable ? (
    <TableChapter
      title={title}
      headers={tableData}
      data={sorted.chapters}
      caption={caption}
      parseFunction={parseFunction}
      doTotal={doTotal}
      onHeader={sortHeader}
      key="table-chapters"
    />
  ) : (
    <TableVertical
      title={title}
      headers={tableData}
      data={sorted.all}
      caption={caption}
      parseFunction={parseFunction}
      doTotal={doTotal}
      onHeader={sortHeader}
      coloring={state.coloring ? coloringFunction : undefined}
      key="table-verticals"
    />
  );

  return (
    <Fragment>
      <Row style={{ marginTop: '1em' }}>
        <Col>
          <h5 id="DetallesPorEstudiante">Detalle por estudiante</h5>
        </Col>
      </Row>
      <Row>
        <Col>
          <AsyncCSVButton
            text="Descargar Datos"
            filename="detalle_estudiantes.csv"
            headers={
              state.useChaptersTable
                ? ['Estudiantes', ...tableData.chapters.map((el) => el.name)]
                : ['Estudiantes', ...tableData.verticals.map((el) => el.val)]
            }
            data={state.useChaptersTable ? rowData.chapters : rowData.all}
          />
        </Col>
        <Col>
          <ValidationFormGroup for="group-modules">
            <Input
              type="checkbox"
              id="group-modules"
              name="groupmodules"
              label="Agrupar Módulos"
              checked={state.useChaptersTable}
              data-testid="group-modules"
              onChange={(e) => {
                toggleChapters(e.target.checked, 'useChaptersTable');
              }}
            />
            <label htmlFor="group-modules">Agrupar Módulos</label>
          </ValidationFormGroup>
        </Col>

        {!state.useChaptersTable && (
          <Col key="coloring-transition">
            <ValidationFormGroup for="coloring-verticals">
              <Input
                type="checkbox"
                id="coloring-verticals"
                name="colorme"
                label="Colorear"
                checked={state.coloring}
                data-testid="coloring-verticals"
                onChange={(e) => {
                  toggleChapters(e.target.checked, 'coloring');
                }}
              />
              <label htmlFor="coloring-verticals">Colorear</label>
            </ValidationFormGroup>
          </Col>
        )}
        <Col>
          <SearchField
            onSubmit={(value) => searchStudent(value)}
            onClear={() => searchStudent('')}
            placeholder="Estudiante"
          />
        </Col>
      </Row>
      {doAnimation ? <TransitionReplace>{table}</TransitionReplace> : table}
    </Fragment>
  );
};

StudentDetails.propTypes = {
  tableData: PropTypes.shape({
    all: PropTypes.number.isRequired,
    chapters: PropTypes.array.isRequired,
    sequentials: PropTypes.array.isRequired,
    verticals: PropTypes.array.isRequired,
  }).isRequired,
  rowData: PropTypes.shape({
    all: PropTypes.array.isRequired,
    chapters: PropTypes.array.isRequired,
  }).isRequired,
  title: PropTypes.string,
  caption: PropTypes.string,
  doTotal: PropTypes.bool,
  doAnimation: PropTypes.bool,
};

export default StudentDetails;
