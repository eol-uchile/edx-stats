import React, { Fragment, useEffect, useState } from 'react';
import { Container, Row, Col, InputGroup } from 'react-bootstrap';
import { Spinner } from '@edx/paragon';
import { useMediaQuery } from 'react-responsive';
import { AsyncCSVButton } from '../../common';
import TimeLineArea from './TimeLineArea';
import PropTypes from 'prop-types';
/**
 * DateBrowser
 *
 * Display a chart using mapping dictionary and data loaded in VisitsTable.
 * While is loading, instead display a spinner.
 * If there are errors, display a message.
 * Include one button to change data visualization.
 * @param {Object} props
 * @returns
 */
const DateBrowser = ({ title, data, mapping, loading, haveErrors }) => {
  const [state, setState] = useState({
    selected: '',
    options: [],
    csv: [],
    headers: [],
  });

  const isShort = useMediaQuery({ maxWidth: 418 });

  const dateToYearMonth = (d) => `${d.getUTCMonth() + 1}-${d.getFullYear()}`;

  useEffect(() => {
    if (data.length > 0) {
      let options = data.map((el, k) => ({
        value: new Date(el.date),
        key: k,
      }));

      let headers = ['Fecha', ...Object.values(mapping)];
      let csv = [];
      data.forEach((month) => {
        month.data.forEach((dataPoint) => {
          csv.push([
            dataPoint.date,
            ...Object.keys(mapping).map((k) => dataPoint[k]),
          ]);
        });
      });

      setState({
        ...state,
        options: options.map((el) => ({
          value: dateToYearMonth(el.value),
          key: el.key,
        })),
        selected: 0,
        headers,
        csv,
      });
    } else {
      setState({
        selected: '',
        options: [],
        csv: [],
        headers: [],
      });
    }
  }, [data]);

  const tooltipParser = (dict) => {
    let body = {};
    for (const [key, value] of Object.entries(dict)) {
      body[key] = { label: `${value}: {}` };
    }
    return body;
  };
  return (
    <Container fluid id="date-browser">
      <Row>
        <Col>
          <h4>{title}</h4>
        </Col>
      </Row>
      {!loading && state.options.length > 0 ? (
        <Fragment>
          <Row>
            <Col sm={6}>
              <AsyncCSVButton
                text="Descargar Datos"
                filename="visitas_diarias.csv"
                headers={state.headers}
                data={state.csv}
              />
            </Col>
            <Col sm={6}>
              <InputGroup
                style={
                  isShort
                    ? { margin: '1rem 0', flexWrap: 'nowrap', width: 'auto' }
                    : {
                        paddingRight: '1.5rem',
                        flexWrap: 'nowrap',
                        width: 'auto',
                      }
                }
                className={isShort ? 'float-left' : 'float-right'}
              >
                <InputGroup.Prepend>
                  <InputGroup.Text>Periodo de Visualización</InputGroup.Text>
                </InputGroup.Prepend>
                <select
                  id="month-select"
                  data-testid="month-select"
                  type="date"
                  value={state.selected}
                  onChange={(e) => {
                    setState({
                      ...state,
                      selected: Number(e.target.value),
                    });
                  }}
                >
                  {state.options.map((el) => (
                    <option key={el.value} value={el.key}>
                      {el.value}
                    </option>
                  ))}
                </select>
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <TimeLineArea
                data={data[state.selected] ? data[state.selected].data : []}
                xKey="date"
                yLabel="Visitas Totales"
                xProps={{ angle: -10 }}
                tooltip={{
                  title: 'Fecha {}',
                  body: tooltipParser(mapping),
                  order: 'dec',
                }}
              />
            </Col>
          </Row>
        </Fragment>
      ) : !haveErrors && loading ? (
        <Row>
          <Col style={{ textAlign: 'left', marginLeft: '2rem' }}>
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      ) : (
        <Row>
          <Col>No hay datos</Col>
        </Row>
      )}
    </Container>
  );
};

DateBrowser.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      data: PropTypes.array.isRequired,
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  haveErrors: PropTypes.bool.isRequired,
};

export default DateBrowser;
