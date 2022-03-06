import React, { useMemo, useState, Fragment, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import { Spinner } from '@edx/paragon';
import { AsyncCSVButton, StackedBar } from '../../common';
import { videosActions } from '../';
import { useProcessCoverage } from '../hooks';
import PropTypes from 'prop-types';

const VideoCoverage = ({ tableData, errors, setErrors }) => {
  const videos = useSelector((state) => state.videos);
  const dispatch = useDispatch();

  const recoverCoverage = useCallback((i) => {
    dispatch(videosActions.recoverCoverage(i));
  }, []);

  const [rowData, setRowData] = useProcessCoverage(
    tableData,
    videos.coverage,
    recoverCoverage,
    errors
  );

  const csvHeaders = useMemo(
    () => ['Unidad', ...rowData.values.map((el) => el.tooltip)],
    [rowData.values]
  );

  const csvData = useMemo(
    () => [
      ['Componente', ...rowData.values.map((el) => el.position)],
      [
        'Visualizaciones mayores al 90%',
        ...rowData.values.map((el) => el.Completo),
      ],
      [
        'Visualizaciones menores al 90%',
        ...rowData.values.map((el) => el.Incompleto),
      ],
    ],
    [rowData.values]
  );

  return (
    <Container fluid id="Cobertura">
      <Row>
        <Col>
          <h4>Cobertura</h4>
        </Col>
      </Row>
      {rowData.loaded && rowData.values.length > 0 ? (
        <Fragment>
          <Row>
            <Col sm={6}>
              <AsyncCSVButton
                text="Descargar Datos"
                filename="cobertura_videos.csv"
                headers={csvHeaders}
                data={csvData}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <StackedBar
                data={rowData.values}
                xKey="position"
                xLabel="Ubicación"
                yLabel="Estudiantes"
                tooltip={{
                  title: '{}:',
                  body: {
                    Completo: 'Visualizaciones completas',
                    Incompleto: 'Visualizaciones parciales',
                  },
                  order: 'reversed',
                }}
              />
            </Col>
          </Row>
        </Fragment>
      ) : errors.length === 0 && !rowData.loaded ? (
        <Row>
          <Col style={{ textAlign: 'left', marginLeft: '2rem' }}>
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      ) : (
        <Row>
          <Col>No hay datos</Col>
        </Row>
      )}
    </Container>
  );
};

VideoCoverage.propTypes = {
  tableData: PropTypes.shape({
    loaded: PropTypes.bool.isRequired,
    videos: PropTypes.shape({
      duration: PropTypes.number,
      position: PropTypes.string,
      tooltip: PropTypes.string,
    }).isRequired,
  }).isRequired,
  errors: PropTypes.array.isRequired,
  setErrors: PropTypes.func.isRequired,
};

export default VideoCoverage;
