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
import { useProcessCsvData } from '../../hooks';
/**
 * VideoDetailed
 *
 * Display a chart using courseVideo loaded in VideosTable.
 * Load data to be displayed in the chart.
 * While is loading, instead display a spinner.
 * If there are errors, display a message.
 * Include two buttons to download data and change video.
 * @param {Object} props
 * @returns
 */
const VideoDetailed = ({ courseVideos, errors }) => {
  const videos = useSelector((state) => state.videos);
  const dispatch = useDispatch();

  const recoverVideoDetails = useCallback((i, v) => {
    dispatch(videosActions.recoverVideoDetails(i, v));
  }, []);

  const [videoSelector, setVideoSelector, rowData, setRowData] =
    useProcessDetailed(
      courseVideos,
      videos.detailed,
      recoverVideoDetails,
      errors
    );

  const isShort = useMediaQuery({ maxWidth: 418 });

  const csvData = useProcessCsvData(rowData.values, {
    second: 'Minuto',
    Visualizaciones: 'Visualizaciones únicas',
    Repeticiones: 'Repeticiones',
  });

  return (
    <Container fluid id="DetallesPorVideo">
      <Row>
        <Col>
          <h4>Detalles por video</h4>
        </Col>
      </Row>
      {courseVideos.loaded && errors.length === 0 && (
        <Row>
          <Col sm={6}>
            {rowData.loaded && (
              <AsyncCSVButton
                text="Descargar Datos"
                filename={`detalles_video_${videoSelector.options[
                  videoSelector.selected
                ].value.replace(/\s/g, '_')}.csv`}
                headers={csvData.headers}
                data={csvData.body}
              />
            )}
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
                disabled={!rowData.loaded}
              >
                {videoSelector.options.map((el, k) => (
                  <option key={k} value={el.key}>
                    {el.value}
                  </option>
                ))}
              </select>
            </InputGroup>
          </Col>
        </Row>
      )}
      {rowData.loaded && rowData.values.length > 0 ? (
        <Fragment>
          <Row>
            <Col>
              <StackedArea
                data={rowData.values}
                xKey="second"
                tooltip={{
                  title: 'Minuto {}',
                  body: {
                    Visualizaciones: { label: 'Reproducciones: {}' },
                    Repeticiones: { label: 'Repeticiones: {}' },
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

VideoDetailed.propTypes = {
  courseVideos: PropTypes.shape({
    loaded: PropTypes.bool.isRequired,
    videos: PropTypes.shape({
      duration: PropTypes.number,
      val: PropTypes.string,
      name: PropTypes.string,
    }).isRequired,
  }).isRequired,
  errors: PropTypes.array.isRequired,
};

export default VideoDetailed;
