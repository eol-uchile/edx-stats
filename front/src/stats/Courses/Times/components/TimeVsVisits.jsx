import React, { useState, useMemo, Fragment } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Form } from '@edx/paragon';
import { useMediaQuery } from 'react-responsive';
import { AsyncCSVButton, MultiAxisBars } from '../../common';
import { parseFloatToTimeString } from '../../helpers';
import useProcessCsvData from '../../hooks/useProcessCsvData';

const TimeVsVisits = ({ tableData, rowData }) => {
  const [state, setState] = useState(true);

  const isShort = useMediaQuery({ maxWidth: 418 });

  const csvData = useProcessCsvData(rowData.verticals, {
    val: 'Ubicación',
    tooltip: 'Título',
    students: 'Estudiantes',
    visits: 'Tiempo total (seg)',
  });

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
            headers={csvData.headers}
            data={csvData.body}
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
            xKey="val"
            xLabel={state ? 'Secciones' : 'Unidades'}
            yLabel={['Tiempo', 'Visitas']}
            tooltip={{
              title: state ? '' : '{}:', // modules already have labels
              body: {
                'Tiempo de visualización': {
                  label: 'Tiempo total: {}',
                  parser: parseFloatToTimeString,
                },
                'Visitas Únicas usuarios': { label: 'Visitas únicas: {}' },
              },
            }}
          />
        </Col>
      </Row>
    </Fragment>
  );
};

export default TimeVsVisits;
