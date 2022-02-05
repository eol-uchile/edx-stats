import React, { useMemo, useState, Fragment } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Form } from '@edx/paragon';
import { useMediaQuery } from 'react-responsive';
import { AsyncCSVButton, RadialBar } from '../../common';

const CompletionTotals = ({ rowData, tableData }) => {
  const [state, setState] = useState(true);

  const isShort = useMediaQuery({ maxWidth: 418 });

  const rowDataChart = useMemo(
    () =>
      rowData.verticals.map((v) => ({
        'Verticales completados': v.completed,
        Estudiantes: v.students,
        ...v,
      })),
    [rowData.verticals]
  );

  const rowDataChaptersChart = useMemo(
    () =>
      rowData.grouped_verticals.map((el, k) => ({
        'Verticales completados': el.completed,
        'Total de estudiantes': el.students,
        tooltip: tableData.chapters[k].name,
        val: 'Módulo ' + (k + 1),
      })),
    [rowData.grouped_verticals]
  );

  const csvHeaders = useMemo(
    () => ['Título', ...tableData.verticals.map((el) => el.tooltip)],
    [tableData.verticals]
  );

  const csvData = useMemo(
    () => [
      ['Sección', ...tableData.verticals.map((el) => el.val)],
      ['Tiempo total (s)', ...rowData.verticals.map((el) => el.visits)],
    ],
    [tableData.verticals, rowData.verticals]
  );

  return (
    <Fragment>
      <Row>
        <Col sm={6}>
          <AsyncCSVButton
            text="Descargar Datos"
            filename="visitas_totales.csv"
            headers={csvHeaders}
            data={csvData}
          />
        </Col>
        <Col sm={6}>
          <Form.Group
            controlId="group-mod-chapters-ch"
            style={
              isShort
                ? { margin: '1rem 0' }
                : {
                    paddingRight: '1.5rem',
                  }
            }
            className={isShort ? 'float-left' : 'float-right'}
          >
            <Form.Check
              type="switch"
              name="group-mod-chapters-ch"
              id="group-mod-chapters-ch"
              label="Agrupar Secciones"
              checked={state}
              onChange={(e) => {
                setState(e.target.checked);
              }}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <RadialBar data={state ? rowDataChaptersChart : rowDataChart} />
        </Col>
      </Row>
    </Fragment>
  );
};

export default CompletionTotals;
