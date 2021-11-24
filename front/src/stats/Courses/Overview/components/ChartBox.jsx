import React from 'react';
import PropTypes from 'prop-types';

const ChartBox = ({ title, children }) => {
  const chartBox = {
    padding: '0.75rem 1.25rem',
    borderRadius: '0.375rem',
    border: '1px solid rgba(0, 0, 0, 0.125)',
    margin: '1.5rem 0',
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 3px',
  };
  const titleStyle = {
    padding: '1rem',
    borderRadius: '.325rem',
    backgroundColor: '#00a8ff',
    color: 'white',
    marginTop: '-2rem',
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 8px',
  };
  return (
    <div style={chartBox}>
      <h4 style={titleStyle}>{title}</h4>
      {children}
    </div>
  );
};

ChartBox.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
};

export default ChartBox;
