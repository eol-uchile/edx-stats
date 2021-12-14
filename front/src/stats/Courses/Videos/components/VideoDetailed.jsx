import React, {
  useMemo,
  useState,
  useEffect,
  Fragment,
  useCallback,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, InputGroup } from 'react-bootstrap';
import { Spinner } from '@edx/paragon';
import { useMediaQuery } from 'react-responsive';
import { AsyncCSVButton, StackedArea } from '../../common';
import { videosActions } from '../';
import { useProcessDetailed } from '../hooks';
import PropTypes from 'prop-types';

const VideoDetailed = ({ tableData, errors, setErrors }) => {
  const videos = useSelector((state) => state.videos);
  const dispatch = useDispatch();

  const recoverVideoDetails = useCallback((i, v) => {
    dispatch(videosActions.recoverVideoDetails(i, v));
  }, []);

  const [videoSelector, setVideoSelector, rowData, setRowData] =
    useProcessDetailed(tableData, videos.detailed, recoverVideoDetails, errors);

  const isShort = useMediaQuery({ maxWidth: 418 });

  const csvHeaders = useMemo(
    () => ['Segundo', ...rowData.values.map((el) => el.second)],
    [rowData.values]
  );

  const csvData = useMemo(
    () => [
      [
        'Visualizaciones únicas',
        ...rowData.values.map((el) => el.Visualizaciones),
      ],
      ['Repeticiones', ...rowData.values.map((el) => el.Repeticiones)],
    ],
    [rowData.values]
  );

  return (
    <Container fluid id="DetallesPorVideo">
      <Row>
        <Col>
          <h4>Detalles por video</h4>
        </Col>
      </Row>
      {rowData.loaded && rowData.values.length > 0 ? (
        <Fragment>
          <Row>
            <Col sm={6}>
              <AsyncCSVButton
                text="Descargar Datos"
                filename={`${
                  videoSelector.options[videoSelector.selected].value
                }.csv`}
                headers={csvHeaders}
                data={csvData}
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
                  <InputGroup.Text>Video</InputGroup.Text>
                </InputGroup.Prepend>
                <select
                  id="video-select"
                  data-testid="video-select"
                  type="date"
                  value={videoSelector.selected}
                  onChange={(e) => {
                    setVideoSelector({
                      ...videoSelector,
                      selected: Number(e.target.value),
                    });
                  }}
                >
                  {videoSelector.options.map((el) => (
                    <option value={el.key}>{el.value}</option>
                  ))}
                </select>
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <StackedArea
                data={rowData.values}
                bar1_key="Visualizaciones"
                bar2_key="Repeticiones"
                name_key="second"
                y_label="Visualizaciones totales"
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

VideoDetailed.propTypes = {
  tableData: PropTypes.shape({
    loaded: PropTypes.bool.isRequired,
    videos: PropTypes.shape({
      duration: PropTypes.number,
      position: PropTypes.string,
      name: PropTypes.string,
    }).isRequired,
  }).isRequired,
  errors: PropTypes.array.isRequired,
  setErrors: PropTypes.func.isRequired,
};

export default VideoDetailed;
