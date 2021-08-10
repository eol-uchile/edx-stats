import React, { Fragment, useState, useEffect, useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Form } from '@edx/paragon';
import { useMediaQuery } from 'react-responsive';
import { ChartBox } from '.';
import { PieChart, LineArea } from '../../common';

const ChartBoxes = ({ data, tableData }) => {
  const [state, setState] = useState(false);

  const isShort = useMediaQuery({ maxWidth: 418 });

  const [dataline, setDataline] = useState([]);
  const [dataPie, setDataPie] = useState([]);

  useEffect(() => {
    if (data.week_times.length !== 0 && data.week_visits.length !== 0) {
      // transforms seconds to minutes
      let timesLineArea = data.week_times.map((t, k) => ({
        date: t.time,
        Tiempo: Math.floor(t.total / 60),
      }));
      // removes ISO format in date 
      let visitsLineArea = data.week_visits.map((v, k) => ({
        date: v.time.slice(0, 10),
        Visitas: v.total,
      }));

      // [{date: '2019-01-01', Tiempo: 1}, ...] merge with
      // [{date: '2019-01-01' Visitas: 1}, ...]
      // NOTA: si el endpoint de times recibe una fecha distinta
      // a las fechas del endpoint de visits entonces no podrian mezclarse
      let dataPerDay = timesLineArea.map((t, k) => ({
        ...t,
        ...visitsLineArea[k],
      }));
      setDataline(dataPerDay);
    }
  }, [data.week_times, data.week_visits]);

  useEffect(() => {
    let statsUnnamed = state ? data.module_visits : data.seq_visits;
    let arrayTitles = state ? tableData.chapters : tableData.sequentials;
    if (statsUnnamed.length !== 0 && arrayTitles.length !== 0) {
      let dataCompleted = [];
      statsUnnamed.forEach((v, k) => {
        if (k < tableData.sequentials.length) {
          // la asignacion de nombre segun k sirve
          // siempre que la cuenta de visitas por secuencia del backend
          // este ordenada con la lista de nombres de secuencias
          // esto no ocurre si se borra una secuencia intermedia
          // mientras que las visitas de esta siguen registradas por el backend

          //solucion: sequentials desde estructura de curso devuelva id
          // y matchear con id de cuenta backend

          //mejor solucion: desde cuenta backend vengan nombrados
          // y con eso filtrados las cuentas cuyos cursos no siguen existiendo
          let name = state
            ? arrayTitles.find((ch) => ch.id === v.vertical__chapter).name
            : `${tableData.sequentials[k].val} : ${tableData.sequentials[k].name}`;
          let itemWithName = {
            name: name,
            value: v.total,
          };
          dataCompleted.push(itemWithName);
        }
      });
      setDataPie(dataCompleted);
    }
  }, [state, data.module_visits, data.seq_visits, tableData]);

  return (
    <Fragment>
      <Row>
        <Col lg="6">
          <ChartBox title={'Actividad durante la semana'}>
            <LineArea data={dataline} dataKey={'date'} />
          </ChartBox>
        </Col>
        <Col lg="6">
          <ChartBox title={'Contenido visitado durante la semana'}>
            <Row>
              <Col>
                <Form.Group
                  controlId="group-mod-tableData.chapters-ch"
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
                    id="group-mod-tableData.chapters-ch"
                    name="group-mod-tableData.chapters-ch"
                    label="Agrupar Módulos"
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
                <PieChart data={dataPie} />
              </Col>
            </Row>
          </ChartBox>
        </Col>
      </Row>
    </Fragment>
  );
};

export default ChartBoxes;
