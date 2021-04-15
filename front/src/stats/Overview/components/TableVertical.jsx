import React, { Fragment, useEffect, useState } from 'react';
import {
  Table as TableBT,
  Tooltip,
  OverlayTrigger,
  Row,
  Col,
} from 'react-bootstrap';
import { Pagination } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSort,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { parseToTableRows } from '../helpers';

/**
 * Display course data with sub headers
 * for chapter, sequential and verticals
 * with pagination support
 */
const TableVertical = ({
  title,
  headers,
  data,
  errors = [],
  caption,
  defaultPage = 10,
  doTotal = false,
  parseFunction = (e) => e,
  onHeader = (e, _) => e,
  coloring = (e) => e,
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
          Mostrando {subArray.length} de {pagination.total}{' '}
        </Col>
      </Row>
      <Row>
        <Col className="times-table-column">
          <TableBT bordered hover size="sm" responsive striped>
            <caption>
              {caption}: {title}
            </caption>
            <colgroup />
            {headers.chapters.map((el, k) => (
              <colgroup span={el.subtotal} key={k}></colgroup>
            ))}
            <thead>
              <tr key="first-header-row">
                <th rowSpan="3" onClick={() => onClickHeader(0)}>
                  Estudiantes
                  {0 === state.column ? arrow : gray_sort}
                </th>
                {headers.chapters.map((el) => (
                  <th colSpan={el.subtotal} key={el.name}>
                    {el.name}
                  </th>
                ))}
                {doTotal && (
                  <th
                    rowSpan="3"
                    onClick={() => onClickHeader(headers.verticals.length + 1)}
                    key="total-col"
                  >
                    Total
                    {headers.verticals.length + 1 === state.column
                      ? arrow
                      : gray_sort}
                  </th>
                )}
              </tr>
              <tr key="second-header-row">
                {headers.sequentials.map((seq) => (
                  <th colSpan={seq.total_verticals} scope="col" key={seq.name}>
                    {seq.val}
                  </th>
                ))}
              </tr>
              <tr key="third-header-row">
                {headers.verticals.map((el, k) => (
                  <th key={el.id} onClick={() => onClickHeader(k + 1)}>
                    <OverlayTrigger
                      key={el.id}
                      placement={'bottom'}
                      overlay={(props) => (
                        <Tooltip id={`tooltip-${el.id}`} {...props}>
                          {el.tooltip}.
                        </Tooltip>
                      )}
                    >
                      <span>
                        {el.val}
                        {k + 1 === state.column ? arrow : gray_sort}
                      </span>
                    </OverlayTrigger>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {errors.length === 0 &&
                subArray.map((e, k) =>
                  parseToTableRows(e, k, parseFunction, coloring)
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
              onPageSelect={(page) => {
                setPagination({ ...pagination, current: page });
              }}
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

TableVertical.propTypes = {
  title: PropTypes.string,
  headers: PropTypes.shape({
    chapters: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        subtotal: PropTypes.number,
      })
    ),
    sequentials: PropTypes.arrayOf(PropTypes.object),
    verticals: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.any,
        tooltip: PropTypes.any,
        val: PropTypes.string,
      })
    ),
  }).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
  ).isRequired,
  errors: PropTypes.array,
  caption: PropTypes.string.isRequired,
  defaultPage: PropTypes.number,
};

export default TableVertical;
