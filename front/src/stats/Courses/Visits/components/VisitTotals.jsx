import React, { useMemo, useState, Fragment } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Form } from '@edx/paragon';
import { useMediaQuery } from 'react-responsive';
import { AsyncCSVButton, ParallelBar } from '../../common';
import { useProcessCsvData } from '../../hooks';
/**
 * VisitTotals
 *
 * Display a chart using courseStructure and data loaded for VisitsTable.
 * Include two buttons to download data and change data visualization.
 * @param {Object} props
 * @returns
 */
const VisitTotals = ({ courseStructure, rowData }) => {
  const [state, setState] = useState(true);

  const isShort = useMediaQuery({ maxWidth: 418 });

  const rowDataChart = useMemo(
    () =>
      rowData.verticals.map((v) => ({
        'Visitas totales': v.visits,
        'Visitas Únicas usuarios': v.students,
        ...v,
      })),
    [rowData.verticals]
  );

  const rowDataChaptersChart = useMemo(
    () =>
      rowData.grouped_verticals.map((el, k) => ({
        'Visitas totales': el.visits,
        'Visitas Únicas usuarios': el.students,
        tooltip: courseStructure.chapters[k].name,
        val: 'Módulo ' + (k + 1),
      })),
    [rowData.grouped_verticals]
  );

  const csvData = useProcessCsvData(rowData.verticals, {
    val: 'Ubicación',
    tooltip: 'Título',
    students: 'Estudiantes',
    visits: 'Tiempo total (min)',
  });

  return (
    <Fragment>
      <Row>
        <Col sm={6}>
          <AsyncCSVButton
            text="Descargar Datos"
            filename="visitas_totales.csv"
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
          <ParallelBar
            data={state ? rowDataChaptersChart : rowDataChart}
            xKey="val"
            xLabel={state ? 'Secciones' : 'Unidades'}
            yLabel={'Visitas'}
            tooltip={{
              title: state ? '' : '{}:', // modules already have labels
              body: {
                'Visitas Únicas usuarios': {
                  label: 'Estudiantes que vieron el contenido: {}',
                },
                'Visitas totales': { label: 'Total de minutos vistos: {}' },
              },
            }}
          />
        </Col>
      </Row>
    </Fragment>
  );
};

export default VisitTotals;
