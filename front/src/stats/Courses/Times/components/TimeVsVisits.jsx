import React, { useState, useMemo, Fragment } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Form } from '@edx/paragon';
import { useMediaQuery } from 'react-responsive';
import { AsyncCSVButton, MultiAxisBars } from '../../common';

const TimeVsVisits = ({ tableData, rowData }) => {
  const [state, setState] = useState(true);

  const isShort = useMediaQuery({ maxWidth: 418 });

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

  const rowDataChart = useMemo(
    () =>
      rowData.verticals.map((v) => ({
        'Tiempo de visualización': v.visits,
        'Visitas Únicas usuarios': v.students,
        ...v,
      })),
    [rowData.verticals]
  );

  const rowDataChaptersChart = useMemo(
    () =>
      rowData.grouped_verticals.map((el, k) => ({
        'Tiempo de visualización': el.visits,
        'Visitas Únicas usuarios': el.students,
        tooltip: tableData.chapters[k].name,
        val: 'Módulo ' + (k + 1),
      })),
    [rowData.grouped_verticals]
  );

  return (
    <Fragment>
      <Row>
        <Col sm={6}>
          <AsyncCSVButton
            text="Descargar Datos"
            filename="tiempos_totales.csv"
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
              id="group-mod-chapters-ch"
              name="group-mod-chapters-ch"
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
          <MultiAxisBars
            data={state ? rowDataChaptersChart : rowDataChart}
            bar1_key="Tiempo de visualización"
            bar2_key="Visitas Únicas usuarios"
            name_key="val"
            x_label={state ? 'Secciones' : 'Unidades del curso'}
            y1_label="Tiempo"
            y2_label="Visitas"
            tooltipLabel={!state} // modules already have labels
          />
        </Col>
      </Row>
    </Fragment>
  );
};

export default TimeVsVisits;
