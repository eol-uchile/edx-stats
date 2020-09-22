import React, { Component } from 'react';
import { CSVLink } from 'react-csv';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

const default_headers = [''];
const default_data = [''];

const AsyncCSVButton = ({
  data = default_data,
  headers = default_headers,
  filename = 'Hola.csv',
  text,
}) => {
  return (
    <CSVLink
      data={data}
      headers={headers}
      filename={filename}
      asyncOnClick={true}
      onClick={(_, done) => done()}
    >
      <FontAwesomeIcon icon={faFileCsv} style={{ color: 'green' }} /> {text}
    </CSVLink>
  );
};

AsyncCSVButton.propTypes = {
  data: PropTypes.array,
  headers: PropTypes.array,
  filename: PropTypes.array,
  text: PropTypes.string.isRequired,
};

export default AsyncCSVButton;
