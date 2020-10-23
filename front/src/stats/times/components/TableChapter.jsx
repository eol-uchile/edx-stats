import React, { Fragment, useEffect, useState } from 'react';
import { Table as TableBT, Row, Col } from 'react-bootstrap';
import { Pagination } from '@edx/paragon';
import PropTypes from 'prop-types';

const parseToTableRows = (r, k) => (
  <tr key={'row' + k}>
    {r.map((d, kd) => (
      <td key={kd}>{d}</td>
    ))}
  </tr>
);

const TableChapter = ({ title, headers, data, errors }) => {
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
            <thead>
              <tr>
                <th>Estudiantes</th>
                {headers.chapters.map((el) => (
                  <th key={el.name}>{el.name}</th>
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
  headers: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  errors: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default TableChapter;
