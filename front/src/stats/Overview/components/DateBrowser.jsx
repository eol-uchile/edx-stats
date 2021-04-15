import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { TimeLineArea } from '.';
import { Form } from '@edx/paragon';
import PropTypes from 'prop-types';

const DateBrowser = ({ title, data, mapping }) => {
  const [state, setState] = useState({ selected: '', options: [] });

  const dateToYearMonth = (d) => `${d.getMonth()}-${d.getFullYear()}`;

  useEffect(() => {
    if (data.length > 0) {
      let options = data.map((el, k) => ({
        value: new Date(el.date + '-1'),
        key: k,
      }));
      setState({
        ...state,
        options: options.map((el) => ({
          value: dateToYearMonth(el.value),
          key: el.key,
        })),
        selected: 0,
      });
    }
  }, [data]);

  return (
    <Row>
      <Col>
        <h4>{title}</h4>
        <Form.Group>
          <Form.Label>Meses disponibles</Form.Label>
          <Form.Control
            as="select"
            data-testid="month-select"
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
          </Form.Control>
        </Form.Group>
        {state.options.length > 0 && (
          <TimeLineArea
            data={data[state.selected].data}
            keys={Object.keys(mapping)}
            mapping={mapping}
          />
        )}
      </Col>
    </Row>
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
