import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Row,
  Col,
  Spinner,
  InputGroup,
  ListGroup,
  ListGroupItem,
} from 'react-bootstrap';
import { Form, Button, ButtonGroup, Input } from '@edx/paragon';
import { useMediaQuery } from 'react-responsive';
import { ChartBox } from '.';
import { PieChart, LineArea } from '../../common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleDoubleLeft,
  faAngleLeft,
  faAngleRight,
  faAngleDoubleRight,
} from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { useChartBoxes } from '../hooks';
import { overviewActions } from '../';

const ChartBoxes = ({ courseData, errors, setErrors }) => {
  const generalStats = useSelector((state) => state.generalStats);
  const dispatch = useDispatch();

  const recoverCourseDetailedStats = useCallback((i, l, u) => {
    dispatch(overviewActions.recoverCourseDetailedTimes(i, l, u));
    dispatch(overviewActions.recoverCourseDetailedVisits(i, l, u));
  }, []);

  const [viewModules, setViewModules] = useState(true);
  const isShort = useMediaQuery({ maxWidth: 418 });

  const [setWeek, params, dataLine, dataPie] = useChartBoxes(
    generalStats,
    recoverCourseDetailedStats,
    errors,
    setErrors,
    viewModules
  );

  return (
    <ListGroup style={{ margin: '0.5rem 0' }} id="chartboxes">
      <ListGroupItem style={{ backgroundColor: '#f2f2f2' }}>
        <h4>Actividad Semanal</h4>
      </ListGroupItem>
      <ListGroupItem>
        <Row style={{ marginBottom: '1rem' }}>
          <Col>
            {courseData.lowerDate && courseData.upperDate && (
              <p>
                Este curso tiene fechas de inicio{' '}
                {new Date(courseData.lowerDate).toLocaleDateString('es-ES')} y
                de término{' '}
                {new Date(courseData.upperDate).toLocaleDateString('es-ES')}.
                También se puede buscar fuera de estos límites de tiempo.
              </p>
            )}
            <ButtonGroup>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>Periodo</InputGroup.Text>
                </InputGroup.Prepend>
                <Input
                  required
                  id="chart-uDate"
                  type="date"
                  value={params.upperDate.slice(0, 10)}
                  onChange={(e) => setWeek(e.target.value)}
                  disabled={generalStats.loading}
                />
              </InputGroup>
              <Button
                onClick={() => setWeek(courseData.lowerDate)}
                data-testid="chart-startDate"
                title="Ir al inicio del curso"
                disabled={generalStats.loading}
              >
                <FontAwesomeIcon icon={faAngleDoubleLeft} />
              </Button>
              <Button
                onClick={() => setWeek(params.upperDate, -7)}
                title="Retroceder una semana"
                disabled={generalStats.loading}
              >
                <FontAwesomeIcon icon={faAngleLeft} />
              </Button>
              <Button
                onClick={() => setWeek(params.upperDate, 7)}
                title="Avanzar una semana"
                disabled={generalStats.loading}
              >
                <FontAwesomeIcon icon={faAngleRight} />
              </Button>
              <Button
                onClick={() => setWeek(courseData.upperDate)}
                data-testid="chart-endDate"
                title="Ir al fin del curso"
                disabled={generalStats.loading}
              >
                <FontAwesomeIcon icon={faAngleDoubleRight} />
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
        {dataLine.values.length !== 0 && dataPie.values.length !== 0 ? (
          <Row>
            <Col lg="6" className="week-line">
              <ChartBox title={'Total durante la semana'}>
                <LineArea
                  height={438.5}
                  data={dataLine.values}
                  xKey="date"
                  yLabel={'Cantidad diaria'}
                  xProps={{ angle: -10 }}
                  tooltip={{
                    title: 'Fecha {}',
                    body: {
                      Tiempo: { label: 'Tiempo de visualización [s]: {}' },
                      Visitas: { label: 'Cantidad de visitas: {}' },
                    },
                    order: 'dec',
                  }}
                />
              </ChartBox>
            </Col>
            <Col lg="6" className="week-pie">
              <ChartBox title={'Contenido visitado durante la semana'}>
                <Row>
                  <Col>
                    <Form.Group
                      controlId="group-mod-tableData.chapters-ch"
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
                        id="group-mod-tableData.chapters-ch"
                        name="group-mod-tableData.chapters-ch"
                        label="Agrupar Secciones"
                        checked={viewModules}
                        onChange={(e) => {
                          setViewModules(e.target.checked);
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <PieChart data={dataPie.values} xKey="value" />
                  </Col>
                </Row>
              </ChartBox>
            </Col>
          </Row>
        ) : generalStats.loading ||
          ((!dataLine.loaded || !dataPie.loaded) &&
            generalStats.detailed_errors.length === 0) ? (
          <Row>
            <Col style={{ textAlign: 'left', marginLeft: '2rem' }}>
              <Spinner animation="border" variant="primary" />
            </Col>
          </Row>
        ) : (
          <Row>
            <Col>No hay datos para la fecha seleccionada</Col>
          </Row>
        )}
      </ListGroupItem>
    </ListGroup>
  );
};

ChartBoxes.propTypes = {
  courseData: PropTypes.shape({
    allowed: PropTypes.bool,
    courseName: PropTypes.string,
    current: PropTypes.string,
    lowerDate: PropTypes.string.isRequired,
    upperDate: PropTypes.string.isRequired,
  }).isRequired,
  errors: PropTypes.array.isRequired,
  setErrors: PropTypes.func.isRequired,
};

export default ChartBoxes;
