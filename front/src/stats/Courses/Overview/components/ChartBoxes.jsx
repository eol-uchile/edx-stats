import React, { Fragment, useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Form } from '@edx/paragon';
import { useMediaQuery } from 'react-responsive';
import { ChartBox } from '.';
import { PieChart, LineArea } from '../../common';
import PropTypes from 'prop-types';

const ChartBoxes = ({ data }) => {
  const [state, setState] = useState(false);

  const isShort = useMediaQuery({ maxWidth: 418 });

  const [dataline, setDataline] = useState([]);
  const [dataPie, setDataPie] = useState([]);

  useEffect(() => {
    if (data.week_times.length !== 0 && data.week_visits.length !== 0) {
      // removes ISO format in date and transforms seconds to minutes
      let timesLineArea = data.week_times.map((t, k) => ({
        date: t.time.slice(0, 10),
        Tiempo: Math.floor(t.total / 60),
      }));
      // removes ISO format in date
      let visitsLineArea = data.week_visits.map((v, k) => ({
        date: v.time.slice(0, 10),
        Visitas: v.total,
      }));

      // [{date: '2019-01-01', Tiempo: 1}, ...] concat with
      // [{date: '2019-01-01' Visitas: 0}, ...]
      let concat = [...timesLineArea, ...visitsLineArea];
      // [{date: '2019-01-01', Tiempo: 1} <- {date: '2019-01-01' Visitas: 0}]
      let mixed = concat.reduce(function (output, cur) {
        // Get the index of the key-value pair.
        var occurs = output.reduce(function (n, item, i) {
          return item.date === cur.date ? i : n;
        }, -1);
        // If the date is found,
        if (occurs >= 0) {
          // set the current value Visitas to its Visitas field
          output[occurs].Visitas = cur.Visitas;
          // Otherwise,
        } else {
          // add the current item to output
          output = output.concat([cur]);
        }
        return output;
      }, []);
      // sort by date
      let dataPerDay = mixed.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
      });
      setDataline(dataPerDay);
    }
  }, [data.week_times, data.week_visits]);

  useEffect(() => {
    let statsUnnamed = state ? data.module_visits : data.seq_visits;
    if (statsUnnamed.length !== 0) {
      let dataCompleted = [];
      statsUnnamed.forEach((v, k) => {
        let name = state
          ? v.name
          : `${v.chap_number}.${v.seq_number} : ${v.name}`;
        let itemWithName = {
          name: name,
          value: v.total,
        };
        dataCompleted.push(itemWithName);
      });
      setDataPie(dataCompleted);
    }
  }, [state, data.module_visits, data.seq_visits]);

  return (
    <Fragment>
      <Row>
        <Col lg="6">
          <ChartBox title={'Actividad durante la semana'}>
            <LineArea
              data={dataline}
              dataKey={['date', 'Cantidad diaria']}
              areaProps={[
                {
                  type: 'monotone',
                  dataKey: 'Tiempo',
                  stroke: '#8884d8',
                  fill: '#8884d89e',
                  activeDot: { r: 8 },
                },
                {
                  type: 'monotone',
                  dataKey: 'Visitas',
                  stroke: '#82ca9d',
                  fill: '#82ca9da3',
                  activeDot: { r: 8 },
                },
              ]}
            />
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

ChartBoxes.propTypes = {
  data: PropTypes.shape({
    week_times: PropTypes.arrayOf({
      time: PropTypes.string,
      total: PropTypes.number,
    }),
    week_visits: PropTypes.arrayOf({
      time: PropTypes.string,
      total: PropTypes.number,
    }),
    module_visits: PropTypes.arrayOf({
      vertical__chapter: PropTypes.string,
      name: PropTypes.string,
      total: PropTypes.number,
    }),
    seq_visits: PropTypes.arrayOf({
      vertical__sequential: PropTypes.string,
      name: PropTypes.string,
      chap_number: PropTypes.number,
      seq_number: PropTypes.number,
      total: PropTypes.number,
    }),
  }),
};

export default ChartBoxes;
