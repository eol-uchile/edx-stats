import React, { Fragment, useEffect, useState } from 'react';
import {
  Table as TableBT,
  Tooltip,
  OverlayTrigger,
  Row,
  Col,
} from 'react-bootstrap';
import { Pagination } from '@edx/paragon';
import PropTypes from 'prop-types';

const parseToTableRows = (r, k) => (
  <tr key={'row' + k}>
    {r.map((d, kd) => (
      <td key={kd}>{d}</td>
    ))}
  </tr>
);

const TableVertical = ({ title, headers, data, errors }) => {
  const [pagination, setPagination] = useState({
    current: 1,
    total: data.length,
    size: 10,
  });

  useEffect(() => setPagination({ ...pagination, total: data.length }), [data]);

  const subArray = data.slice(
    (pagination.current - 1) * pagination.size,
    pagination.current * pagination.size
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
            <caption>Tiempos de visita: {title}</caption>
            <colgroup />
            {headers.chapters.map((el, k) => (
              <colgroup span={el.subtotal} key={k}></colgroup>
            ))}
            <thead>
              <tr>
                <th rowSpan="3">Estudiantes</th>
                {headers.chapters.map((el) => (
                  <th colSpan={el.subtotal} key={el.name}>
                    {el.name}
                  </th>
                ))}
              </tr>
              <tr>{headers.sequentials}</tr>
              <tr>
                {headers.verticals.map((el) => (
                  <th key={el.id}>
                    <OverlayTrigger
                      key={el.id}
                      placement={'bottom'}
                      overlay={(props) => (
                        <Tooltip id={`tooltip-${el.id}`} {...props}>
                          {el.tooltip}.
                        </Tooltip>
                      )}
                    >
                      <span>{el.val}</span>
                    </OverlayTrigger>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {errors.length === 0 && subArray.map(parseToTableRows)}
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
  headers: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  errors: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default TableVertical;
