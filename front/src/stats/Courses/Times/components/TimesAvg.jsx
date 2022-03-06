import React, { useState, useMemo, Fragment } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Form } from '@edx/paragon';
import { useMediaQuery } from 'react-responsive';
import { AsyncCSVButton, ErrorBarChart } from '../../common';
import { parseFloatToTimeString } from '../../helpers';

const TimesAvg = ({ tableData, rowData }) => {
  const [state, setState] = useState(true);

  const isShort = useMediaQuery({ maxWidth: 418 });

  const averageChart = useMemo(
    () =>
      rowData.verticals.map((v, k) => ({
        'Tiempo promedio visto':
          v.visits / (rowData.all.length !== 0 ? rowData.all.length : 1),
        errorX: rowData.vertical_errors[k],
        ...v,
      })),
    [rowData.verticals]
  );

  const averageChapterChart = useMemo(
    () =>
      rowData.grouped_verticals.map((el, k) => ({
        'Tiempo promedio visto':
          el.visits / (rowData.all.length !== 0 ? rowData.all.length : 1),
        tooltip: tableData.chapters[k].name,
        errorX: rowData.grouped_verticals_errors[k],
        val: 'Módulo ' + (k + 1),
      })),
    [rowData.grouped_verticals]
  );

  const csvHeaders = useMemo(
    () => ['Título', ...tableData.verticals.map((el) => el.tooltip)],
    [tableData.verticals]
  );

  const csvAvData = useMemo(
    () => [
      ['Sección', ...tableData.verticals.map((el) => el.val)],
      [
        'Tiempo promedio visto',
        ...averageChart.map((el) => el['Tiempo promedio visto']),
      ],
      ['Desviación estándar', ...averageChart.map((el) => el['errorX'])],
    ],
    [tableData.verticals, averageChart]
  );

  return (
    <Fragment>
      <Row>
        <Col sm={6}>
          <AsyncCSVButton
            text="Descargar Datos"
            filename="tiempos_promedio.csv"
            headers={csvHeaders}
            data={csvAvData}
          />
        </Col>
        <Col sm={6}>
          <Form.Group
            controlId="group-mod-chapters-ch-av"
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
              id="group-mod-chapters-ch-av"
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
          <ErrorBarChart
            data={state ? averageChapterChart : averageChart}
            xKey="val"
            xLabel={state ? 'Secciones' : 'Unidades del curso'}
            yLabel="Tiempo"
            tooltip={{
              title: state ? '' : '{}:', // modules already have labels
              body: {
                'Tiempo promedio visto': {
                  label: 'Tiempo promedio de visualización: {}',
                  parser: parseFloatToTimeString,
                },
                errorX: {
                  label: 'Desviación estándar: {}',
                  parser: parseFloatToTimeString,
                },
              },
            }}
          />
        </Col>
      </Row>
    </Fragment>
  );
};

export default TimesAvg;
