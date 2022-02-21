import React, { Fragment, useEffect, useState } from 'react';
import { Table as TableBT, Row, Col } from 'react-bootstrap';
import { Pagination } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSort,
  faSortDown,
  faSortUp,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { parseToTableRows } from '../../helpers';

/**
 * Display course data by chapter
 * with pagination support
 */
const TableChapter = ({
  title = '',
  helpMessage = '',
  headers,
  data,
  errors = [],
  caption,
  defaultPage = 10,
  doTotal = false,
  doTip = false,
  parseFunction = (e) => e,
  onHeader = (e, _) => e,
  onRow = (e) => e,
}) => {
  const [pagination, setPagination] = useState({
    current: 1,
    total: data.length,
    size: defaultPage,
  });

  const [state, setState] = useState({ column: 0, up: false });

  useEffect(() => setPagination({ ...pagination, total: data.length }), [data]);

  const subArray = data.slice(
    (pagination.current - 1) * pagination.size,
    pagination.current * pagination.size
  );

  const onClickHeader = (index) => {
    let up = index === state.column ? !state.up : false;
    onHeader(index, up);
    setState({
      column: index,
      up: up,
    });
  };

  const arrow = state.up ? (
    <FontAwesomeIcon icon={faSortUp} />
  ) : (
    <FontAwesomeIcon icon={faSortDown} />
  );

  const gray_sort = (
    <FontAwesomeIcon icon={faSort} style={{ color: 'lightgray' }} />
  );

  return (
    <Fragment>
      <Row>
        <Col>
          Mostrando {subArray.length} de {pagination.total}
        </Col>
        <Col></Col>
      </Row>
      <Row>
        <Col className="times-table-column">
          <TableBT bordered hover size="sm" responsive striped>
            <caption>
              {caption}: {title}
              {helpMessage !== '' && (
                <FontAwesomeIcon
                  icon={faQuestionCircle}
                  dataToggle="tooltip"
                  title={helpMessage}
                />
              )}
            </caption>
            <thead>
              <tr>
                <th onClick={() => onClickHeader(0)}>
                  Estudiantes {0 === state.column ? arrow : gray_sort}
                </th>
                {headers.chapters.map((el, k) => (
                  <th key={el.name} onClick={() => onClickHeader(k + 1)}>
                    {el.name}
                    {k + 1 === state.column ? arrow : gray_sort}
                  </th>
                ))}
                {doTotal && (
                  <th
                    onClick={() => onClickHeader(headers.chapters.length + 1)}
                  >
                    Total
                    {headers.chapters.length + 1 === state.column
                      ? arrow
                      : gray_sort}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {errors.length === 0 &&
                subArray.map((e, k) =>
                  parseToTableRows(e, k, parseFunction, () => '', onRow, doTip)
                )}
              <tr></tr>
            </tbody>
          </TableBT>
        </Col>
      </Row>
      <Row>
        <Col>
          {subArray.length !== 0 && (
            <Pagination
              currentPage={pagination.current}
              paginationLabel="pagination navigation"
              pageCount={Math.ceil(pagination.total / pagination.size)}
              onPageSelect={(page) =>
                setPagination({ ...pagination, current: page })
              }
              buttonLabels={{
                previous: 'Anterior',
                next: 'Siguiente',
                page: 'Página',
                currentPage: 'Página actual',
                pageOfCount: 'de',
              }}
            />
          )}
        </Col>
      </Row>
    </Fragment>
  );
};

TableChapter.propTypes = {
  title: PropTypes.string,
  helpMessage: PropTypes.string,
  headers: PropTypes.shape({
    chapters: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
      })
    ),
  }).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
  ).isRequired,
  errors: PropTypes.array,
  caption: PropTypes.string.isRequired,
  defaultPage: PropTypes.number,
  doTotal: PropTypes.bool,
};

export default TableChapter;
