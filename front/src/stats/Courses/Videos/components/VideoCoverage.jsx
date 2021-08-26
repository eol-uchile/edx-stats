import React, { useMemo, useState, Fragment, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import { Form, Spinner } from '@edx/paragon';
import { useMediaQuery } from 'react-responsive';
import { AsyncCSVButton, StackedBar } from '../../common';
import { videosActions } from '../';
import { useProcessCoverage } from '../hooks';

const VideoCoverage = ({ state, errors, setErrors }) => {
  const videos = useSelector((state) => state.videos);
  const dispatch = useDispatch();

  const recoverCoverage = useCallback((i, l, u) => {
    dispatch(videosActions.recoverCoverage(i, l, u));
  }, []);

  const isShort = useMediaQuery({ maxWidth: 418 });

  const [dataLoaded, setDataLoaded, rowData] = useProcessCoverage(
    videos,
    recoverCoverage,
    errors,
    setErrors,
    state.lowerDate,
    state.upperDate
  );

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
    <Container fluid id="Cobertura">
      <Row>
        <Col>
          <h4>Cobertura</h4>
        </Col>
      </Row>
      {rowData.loaded && rowData.values.length !== 0 ? (
        <Fragment>
          {/* <Row>
            <Col sm={6}>
              <AsyncCSVButton
                text="Descargar Datos"
                filename="cobertura_videos.csv"
                headers={csvHeaders}
                data={csvData}
              />
            </Col>
          </Row> */}
          <Row>
            <Col>
              <StackedBar
                data={rowData.values}
                bar1_key="Completo"
                bar2_key="Incompleto"
                name_key="position"
                x_label="Videos de cada unidad"
                y_label="Visualizaciones"
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

export default VideoCoverage;
