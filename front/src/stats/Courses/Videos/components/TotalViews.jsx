import React, { useMemo, useState, Fragment, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import { Spinner } from '@edx/paragon';
import { AsyncCSVButton, ParallelBar } from '../../common';
import { videosActions } from '../';
import { useProcessViewSum } from '../hooks';
import PropTypes from 'prop-types';
import { useProcessCsvData } from '../../hooks';

const TotalViews = ({ tableData, errors, setErrors }) => {
  const videos = useSelector((state) => state.videos);
  const dispatch = useDispatch();

  const recoverViewSum = useCallback((i) => {
    dispatch(videosActions.recoverViewSum(i));
  }, []);

  const [rowData, setRowData] = useProcessViewSum(
    tableData,
    videos.views,
    recoverViewSum,
    errors
  );

  const csvData = useProcessCsvData(rowData.values, {
    val: 'Ubicación',
    tooltip: 'Título',
    Usuarios: 'Estudiantes',
    Minutos: 'Tiempo total (min)',
  });

  return (
    <Container fluid id="VisualizacionesTotales">
      <Row>
        <Col>
          <h4>Visualizaciones totales</h4>
        </Col>
      </Row>
      {rowData.loaded && rowData.values.length > 0 ? (
        <Fragment>
          <Row>
            <Col sm={6}>
              <AsyncCSVButton
                text="Descargar Datos"
                filename="visualizaciones_totales.csv"
                headers={csvData.headers}
                data={csvData.body}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <ParallelBar
                data={rowData.values}
                xKey="val"
                xLabel="Ubicación"
                yLabel="Total"
                tooltip={{
                  title: '{}:',
                  body: {
                    Usuarios: {
                      label: 'Estudiantes que vieron el contenido: {}',
                    },
                    Minutos: { label: 'Total de minutos vistos: {}' },
                  },
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

TotalViews.propTypes = {
  tableData: PropTypes.shape({
    loaded: PropTypes.bool.isRequired,
    videos: PropTypes.shape({
      duration: PropTypes.number,
      val: PropTypes.string,
      tooltip: PropTypes.string,
    }).isRequired,
  }).isRequired,
  errors: PropTypes.array.isRequired,
  setErrors: PropTypes.func.isRequired,
};

export default TotalViews;
