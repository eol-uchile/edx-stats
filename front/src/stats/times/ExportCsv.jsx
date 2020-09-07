import React, { Component } from 'react';
import { CSVLink } from 'react-csv';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv } from '@fortawesome/free-solid-svg-icons';

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

export default AsyncCSVButton;
