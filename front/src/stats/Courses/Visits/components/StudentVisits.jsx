import React, { useState } from 'react';
import { Form } from '@edx/paragon';
import { Container, Row, Col } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import PropTypes from 'prop-types';
import { StudentDetails } from '../../common';

const StudentVisits = ({ tableData, visits, completion, clickFunction }) => {
  const [useVisitsTable, setTable] = useState(true);
  const isShort = useMediaQuery({ maxWidth: 418 });

  function parseToSymbol(v) {
    let div = v.split('/');
    if (parseInt(div[0]) === parseInt(div[1])) {
      return 'C';
    }
    return 'NC';
  }

  const table = useVisitsTable ? (
    <StudentDetails
      title="Visitas"
      rowData={visits}
      tableData={tableData}
      clickFunction={clickFunction}
      doAnimation
    />
  ) : (
    <StudentDetails
      title="Completitud"
      rowData={completion}
      tableData={tableData}
      clickFunction={clickFunction}
      parseFunction={parseToSymbol}
      doTip
      doAnimation
    />
  );

  return (
    <Container fluid id="DetallesPorEstudiante">
      <Row style={{ marginTop: '1em' }}>
        <Col>
          <h4>Detalle por estudiante</h4>
        </Col>
      </Row>
      <Row>
        <Col sm={!isShort ? 3 : 12} key="table-transition">
          <Form.Group controlId="changing-tables">
            <Form.Check
              type="switch"
              id="changing-tables"
              name="change"
              label="Cambiar a tabla de completitud"
              checked={!useVisitsTable}
              data-testid="changing-tables"
              onChange={(e) => {
                setTable(!useVisitsTable);
              }}
            />
          </Form.Group>
        </Col>
      </Row>
      {table}
    </Container>
  );
};

export default StudentVisits;
