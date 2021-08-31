import React, { useMemo, useState, Fragment, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import { Spinner } from '@edx/paragon';
import { useMediaQuery } from 'react-responsive';
import { AsyncCSVButton, ParallelBar } from '../../common';
import { videosActions } from '../';
import { useProcessViewSum } from '../hooks';

const TotalViews = ({ barData, errors, setErrors }) => {
  const videos = useSelector((state) => state.videos);
  const dispatch = useDispatch();

  const recoverViewSum = useCallback((i) => {
    dispatch(videosActions.recoverViewSum(i));
  }, []);

  const [dataLoaded, setDataLoaded, rowData] = useProcessViewSum(
    videos,
    recoverViewSum,
    errors,
    setErrors,
    barData
  );

  const csvHeaders = useMemo(
    () => ['Unidad', ...rowData.values.map((el) => el.name)],
    [rowData.values]
  );

  const csvData = useMemo(
    () => [
      ['Componente', ...rowData.values.map((el) => el.position)],
      ['Usuarios', ...rowData.values.map((el) => el.Usuarios)],
      ['Tiempo total (m)', ...rowData.values.map((el) => el.Minutos)],
    ],
    [rowData.values]
  );

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
                headers={csvHeaders}
                data={csvData}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <ParallelBar
                data={rowData.values}
                bar1_key="Usuarios"
                bar2_key="Minutos"
                name_key="position"
                x_label="Ubicación de cada video"
                y_label="Total"
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

export default TotalViews;
