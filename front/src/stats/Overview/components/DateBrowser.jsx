import React, { Fragment, useEffect, useState } from 'react';
import { Row, Col, InputGroup } from 'react-bootstrap';
import { Spinner } from '@edx/paragon';
import { TimeLineArea, AsyncCSVButton } from '.';
import PropTypes from 'prop-types';

const DateBrowser = ({ title, data, mapping, loading, haveErrors }) => {
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
    } else {
      setState({
        selected: '',
        options: [],
        csv: [],
        headers: [],
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
      {!loading && state.options.length > 0 ? (
        <Fragment>
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
              <InputGroup
                style={{
                  justifyContent: 'end',
                  paddingRight: '1.5rem',
                  flexWrap: 'nowrap',
                }}
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
                keys={Object.keys(mapping)}
                mapping={mapping}
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
  loading: PropTypes.bool.isRequired,
  haveErrors: PropTypes.bool.isRequired,
};

export default DateBrowser;
