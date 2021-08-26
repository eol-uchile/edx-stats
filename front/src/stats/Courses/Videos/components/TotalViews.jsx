import React, { useMemo, useState, Fragment, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import { Form, Spinner } from '@edx/paragon';
import { useMediaQuery } from 'react-responsive';
import { AsyncCSVButton, ParallelBar } from '../../common';
import { videosActions } from '../';
import { useProcessViewSum } from '../hooks';

const TotalViews = ({ state, errors, setErrors }) => {
  const videos = useSelector((state) => state.videos);
  const dispatch = useDispatch();

  const recoverViewSum = useCallback((i, l, u) => {
    dispatch(videosActions.recoverViewSum(i, l, u));
  }, []);

  const [viewModules, setViewModules] = useState(false);
  const isShort = useMediaQuery({ maxWidth: 418 });

  const [dataLoaded, setDataLoaded, rowData] = useProcessViewSum(
    videos,
    recoverViewSum,
    errors,
    setErrors,
    viewModules,
    state.lowerDate,
    state.upperDate
  );

  // const rowDataChaptersChart = useMemo(
  //   () =>
  //     rowData.videos.map((el, k) => ({
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
    <Container fluid id="VisualizacionesTotales">
      <Row>
        <Col>
          <h4>Visualizaciones totales</h4>
        </Col>
      </Row>
      {rowData.loaded && rowData.values.length !== 0 ? (
        <Fragment>
          {/* <Row>
            <Col sm={6}>
              <AsyncCSVButton
                text="Descargar Datos"
                filename="visitas_totales.csv"
                headers={csvHeaders}
                data={csvData}
              />
            </Col>
            <Col sm={6}>
              <Form.Group
                controlId="group-mod-chapters-ch"
                style={
                  isShort
                    ? { margin: '1rem 0' }
                    : {
                        paddingRight: '1.5rem',
                      }
                }
                className={isShort ? 'float-left' : 'float-right'}
              >
                <Form.Check
                  type="switch"
                  name="group-mod-chapters-ch"
                  id="group-mod-chapters-ch"
                  label="Agrupar Secciones"
                  checked={viewModules}
                  onChange={(e) => {
                    setViewModules(e.target.checked);
                  }}
                />
              </Form.Group>
            </Col>
          </Row> */}
          <Row>
            <Col>
              {/* Totales no diferencia fecha ya que watch_time se
            suma automaticamente */}
              <ParallelBar
                data={rowData.values}
                bar1_key="Usuarios"
                bar2_key="Minutos"
                name_key="position"
                x_label={
                  viewModules ? 'Secciones' : 'Componentes tipo video del curso'
                }
                y_label="Minutos totales"
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
