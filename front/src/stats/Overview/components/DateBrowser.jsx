import React, { Fragment, useEffect, useState } from 'react';
import { Row, Col, InputGroup } from 'react-bootstrap';
import { TimeLineArea, AsyncCSVButton } from '.';
import PropTypes from 'prop-types';

const DateBrowser = ({ title, data, mapping }) => {
  const [state, setState] = useState({
    selected: '',
    options: [],
    csv: [],
    headers: [],
  });

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
    }
  }, [data]);

  return (
    <Fragment>
      <Row>
        <Col>
          <h4 id="date-browser">{title}</h4>
        </Col>
      </Row>
      <Row>
        <Col>
          <AsyncCSVButton
            text="Descargar Datos"
            filename="visitas_diarias.csv"
            headers={state.headers}
            data={state.csv}
          />
        </Col>
        <Col>
          <InputGroup style={{ justifyContent: 'end' }}>
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
          {state.options.length > 0 && (
            <TimeLineArea
              data={data[state.selected] ? data[state.selected].data : []}
              keys={Object.keys(mapping)}
              mapping={mapping}
            />
          )}
        </Col>
      </Row>
    </Fragment>
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
};

export default DateBrowser;
