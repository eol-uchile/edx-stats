import React, { useMemo, useState, Fragment, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import { Spinner } from '@edx/paragon';
import { AsyncCSVButton, StackedBar } from '../../common';
import { videosActions } from '../';
import { useProcessCoverage } from '../hooks';
import PropTypes from 'prop-types';
import { useProcessCsvData } from '../../hooks';
/**
 * VideoCoverage
 *
 * Display a chart using courseVideo loaded in VideosTable.
 * Load data to be displayed in the chart.
 * While is loading, instead display a spinner.
 * If there are errors, display a message.
 * Include one button to download data.
 * @param {Object} props
 * @returns
 */
const VideoCoverage = ({ courseVideos, errors }) => {
  const videos = useSelector((state) => state.videos);
  const dispatch = useDispatch();

  const recoverCoverage = useCallback((i) => {
    dispatch(videosActions.recoverCoverage(i));
  }, []);

  const [rowData, setRowData] = useProcessCoverage(
    courseVideos,
    videos.coverage,
    recoverCoverage,
    errors
  );

  const csvData = useProcessCsvData(rowData.values, {
    val: 'Ubicación',
    tooltip: 'Título',
    Completo: 'Visualizaciones mayores al 90%',
    Incompleto: 'Visualizaciones menores al 90%',
  });

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
                headers={csvData.headers}
                data={csvData.body}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <StackedBar
                data={rowData.values}
                xKey="val"
                xLabel="Ubicación"
                yLabel="Estudiantes"
                tooltip={{
                  title: '{}:',
                  body: {
                    Completo: { label: 'Visualizaciones completas: {}' },
                    Incompleto: { label: 'Visualizaciones parciales: {}' },
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
  courseVideos: PropTypes.shape({
    loaded: PropTypes.bool.isRequired,
    videos: PropTypes.shape({
      duration: PropTypes.number,
      val: PropTypes.string,
      tooltip: PropTypes.string,
    }).isRequired,
  }).isRequired,
  errors: PropTypes.array.isRequired,
};

export default VideoCoverage;
