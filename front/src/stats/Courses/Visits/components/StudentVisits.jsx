import React, { useState } from 'react';
import { Form } from '@edx/paragon';
import { Container, Row, Col } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import PropTypes from 'prop-types';
import { StudentDetails } from '../../common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

const StudentVisits = ({ tableData, visits, completion, clickFunction }) => {
  const [useVisitsTable, setTable] = useState(true);
  const isShort = useMediaQuery({ maxWidth: 418 });

  function parseToIcon(v) {
    if (v === 0) {
      return <FontAwesomeIcon icon={faTimes} />;
    }
    return <FontAwesomeIcon icon={faCheck} />;
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
      parseFunction={parseToIcon}
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
              label="Ver número de visitas"
              checked={useVisitsTable}
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
