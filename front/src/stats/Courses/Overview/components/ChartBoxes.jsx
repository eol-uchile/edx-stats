import React, { Fragment, useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Form } from '@edx/paragon';
import { useMediaQuery } from 'react-responsive';
import { ChartBox } from '.';
import { PieChart, LineArea } from '../../common';
import PropTypes from 'prop-types';

const ChartBoxes = ({ data }) => {
  const [viewModules, setViewModules] = useState(false);

  const isShort = useMediaQuery({ maxWidth: 418 });

  const [dataline, setDataline] = useState([]);
  const [dataPie, setDataPie] = useState([]);

  useEffect(() => {
    if (data.week_times.length !== 0 && data.week_visits.length !== 0) {
      let dailyMinutes = data.week_times.map((t, k) => ({
        date: t.time.slice(0, 10),
        Tiempo: Math.floor(t.total / 60),
      }));
      let dailyVisits = data.week_visits.map((v, k) => ({
        date: v.time.slice(0, 10),
        Visitas: v.total,
      }));

      let concat = dailyMinutes.concat(dailyVisits);
      let dailyStats = concat.reduce(function (output, cur) {
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
      let sortedAscending = dailyStats.sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
      });
      setDataline(sortedAscending);
    }
  }, [data.week_times, data.week_visits]);

  useEffect(() => {
    let unnamedPortions = viewModules ? data.module_visits : data.seq_visits;
    if (unnamedPortions.length !== 0) {
      let circularPortions = [];
      unnamedPortions.forEach((v, k) => {
        let name = viewModules
          ? v.name
          : `${v.chap_number}.${v.seq_number} : ${v.name}`;
        let namedPortion = {
          name: name,
          value: v.total,
        };
        circularPortions.push(namedPortion);
      });
      setDataPie(circularPortions);
    }
  }, [viewModules, data.module_visits, data.seq_visits]);

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
                    checked={viewModules}
                    onChange={(e) => {
                      setViewModules(e.target.checked);
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
