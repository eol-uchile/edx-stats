import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import CountUp from 'react-countup';

const CountBox = ({ end, duration, image, change, caption, countUpProps }) => {
  const digitStyle = {
    fontWeight: 700,
    fontSize: '2.5em',
    fontFamily: 'mono',
  };
  return (
    <Container
      style={{
        margin: '2rem 0',
        borderRadius: '0.375rem',
        border: '1px solid rgba(0, 0, 0, 0.125)',
        boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 3px',
      }}
    >
      <Row>
        <Col>
          <img
            src={image}
            alt="Stat Icon"
            style={{
              height: '5em',
              backgroundColor: '#d0f4ff',
              padding: '1rem',
              borderRadius: '.325rem',
              marginTop: '-1.5rem',
              boxShadow: '0 2px 8px rgba(0.2,0.2,0.2,0.2)',
            }}
          />
        </Col>
        <Col style={{ textAlign: 'right' }}>
          <p style={{ marginBottom: '0', paddingTop: '.325rem' }}>{caption}</p>
          <CountUp
            end={end}
            duration={duration}
            style={digitStyle}
            {...countUpProps}
          />
        </Col>
      </Row>
      {/* 
      <Row>
        <Col>
          <p
            style={{
              fontSize: '1.2rem',
              borderTop: '1px #dfd2d2 solid',
              color: change > 0 ? 'green' : 'red',
            }}
          >
            <FontAwesomeIcon icon={change > 0 ? faArrowUp : faArrowDown} />{' '}
            {change}% semana pasada
          </p>
        </Col>
      </Row> */}
    </Container>
  );
};

export default CountBox;
