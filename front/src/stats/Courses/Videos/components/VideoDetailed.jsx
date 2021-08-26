import React, { useMemo, useState, Fragment, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, InputGroup } from 'react-bootstrap';
import { Form, Spinner } from '@edx/paragon';
import { useMediaQuery } from 'react-responsive';
import { AsyncCSVButton, StackedArea } from '../../common';
import { videosActions } from '../';
import { useLoadVideos, useProcessDetailed } from '../hooks';

const VideoDetailed = ({ state, errors, setErrors }) => {
  const videos = useSelector((state) => state.videos);
  const dispatch = useDispatch();

  // const recoverVideos = useCallback((i) => {
  //   dispatch(videosActions.recoverVideos(i));
  // }, []);

  // const recoverViewSum = useCallback((i, l, u) => {
  //   dispatch(videosActions.recoverViewSum(i, l, u));
  // }, []);

  const isShort = useMediaQuery({ maxWidth: 418 });

  const [videoSelector, setVideoSelector] = useLoadVideos(videos, () => {});
  const [dataLoaded, setDataLoaded, rowData] = useProcessDetailed(
    videos,
    () => {},
    errors,
    setErrors,
    state.lowerDate,
    state.upperDate
  );

  // const rowDataChart = useMemo(
  //   () =>
  //     rowData.detailed.map((v) => ({
  //       'Visualizaciones únicas': v.reproduction,
  //       Repeticiones: v.repetition,
  //       ...v,
  //     })),
  //   [rowData.detailed]
  // );

  // const rowDataChaptersChart = useMemo(
  //   () =>
  //     rowData.detailed.map((el, k) => ({
  //       'Minutos totales': el.visits,
  //       'Visitas Únicas usuarios': el.students,
  //       tooltip: tableData.chapters[k].name,
  //       val: 'Módulo ' + (k + 1),
  //     })),
  //   [rowData.grouped_verticals]
  // );

  // const csvHeaders = useMemo(
  //   () => ['Título', ...tableData.verticals.map((el) => el.tooltip)],
  //   [tableData.verticals]
  // );

  // const csvData = useMemo(
  //   () => [
  //     ['Sección', ...tableData.verticals.map((el) => el.val)],
  //     ['Tiempo total (s)', ...rowData.verticals.map((el) => el.visits)],
  //   ],
  //   [tableData.verticals, rowData.verticals]
  // );

  return (
    <Container fluid id="DetallesPorVideo">
      <Row>
        <Col>
          <h4>Detalles por video</h4>
        </Col>
      </Row>
      {rowData.loaded && rowData.detailed.length !== 0 ? (
        <Fragment>
          <Row>
            <Col sm={6}>
              <AsyncCSVButton
                text="Descargar Datos"
                filename="visitas_totales.csv"
              />
            </Col>
            <Col sm={6}>
              <InputGroup
                style={
                  isShort
                    ? { margin: '1rem 0', flexWrap: 'nowrap', width: 'auto' }
                    : {
                        paddingRight: '1.5rem',
                        flexWrap: 'nowrap',
                        width: 'auto',
                      }
                }
                className={isShort ? 'float-left' : 'float-right'}
              >
                <InputGroup.Prepend>
                  <InputGroup.Text>Periodo de Visualización</InputGroup.Text>
                </InputGroup.Prepend>
                <select
                  id="video-select"
                  data-testid="video-select"
                  type="date"
                  value={videoSelector.selected}
                  onChange={(e) => {
                    setVideoSelector({
                      ...videoSelector,
                      selected: Number(e.target.key),
                    });
                  }}
                >
                  {videoSelector.options.map((el) => (
                    <option key={el.key}>{el.value}</option>
                  ))}
                </select>
              </InputGroup>
            </Col>
          </Row>
          <Row>
            {/* <Col>
              <StackedArea
                data={rowDataChart}
                bar1_key="Visualizaciones únicas"
                bar2_key="Repeticiones"
                name_key={"seconds"}
                x_label="name"
                y_label="Visualizaciones totales"
              />
            </Col> */}
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

export default VideoDetailed;
