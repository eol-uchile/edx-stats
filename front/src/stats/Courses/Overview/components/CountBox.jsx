import React from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import CountUp from 'react-countup';
import PropTypes from 'prop-types';

const CountBox = ({ image, caption, countUpProps, isLoading }) => {
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
          {isLoading ? (
            <Row>
              <Col style={{ textAlign: 'right' }}>
                <Spinner animation="border" variant="primary" />
              </Col>
            </Row>
          ) : (
            <CountUp style={digitStyle} {...countUpProps} />
          )}
        </Col>
      </Row>
    </Container>
  );
};

CountBox.propTypes = {
  image: PropTypes.string.isRequired,
  caption: PropTypes.string.isRequired,
  countUpProps: PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    duration: PropTypes.number.isRequired,
    separator: PropTypes.string.isRequired,
    decimals: PropTypes.number.isRequired,
    decimal: PropTypes.string.isRequired,
  }),
};

export default CountBox;
