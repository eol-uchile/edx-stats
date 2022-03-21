import React from 'react';
import { CSVLink } from 'react-csv';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

const default_headers = [''];
const default_data = [{}];
/**
 * Create a button to download a csv file
 * @param {Object} props
 * @returns
 */
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
      data-testid="csvLink"
      style={{
        border: 'solid 2px #c2f0ff',
        padding: '.325rem',
        borderRadius: '.325rem',
        backgroundColor: '#dff7ff',
      }}
    >
      <FontAwesomeIcon icon={faFileCsv} style={{ color: 'green' }} /> {text}
    </CSVLink>
  );
};

AsyncCSVButton.propTypes = {
  data: PropTypes.array,
  headers: PropTypes.array,
  filename: PropTypes.string,
  text: PropTypes.string.isRequired,
};

export default AsyncCSVButton;
