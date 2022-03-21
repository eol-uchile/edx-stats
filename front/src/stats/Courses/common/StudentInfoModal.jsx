import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { ModalDialog, ActionRow, Avatar } from '@edx/paragon';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { parseStringToDMYDate as getDate } from '../helpers';

const getInfo = (data) => {
  if (data !== null) {
    return data;
  }
  return 'Desconocido';
};
/**
 * Create a two-columns modal.
 * @param {Object} props
 * @returns
 */
const StudentInfoModal = ({ isOpen, doToggle, data, errors }) => {
  return (
    <Fragment>
      <ModalDialog
        title="Student Information"
        isOpen={isOpen}
        onClose={() => doToggle(!isOpen)}
        size="lg"
        hasCloseButton
      >
        <ModalDialog.Header>
          <ModalDialog.Title>Información del estudiante</ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          {!data.loaded ? (
            <Row>
              <Col style={{ textAlign: 'center' }}>
                <Spinner animation="border" variant="primary" />
              </Col>
            </Row>
          ) : data.loaded && errors.length == 0 ? (
            <Fragment>
              <Row>
                <Col style={{ textAlign: 'center' }}>
                  <Avatar size="xxl" />
                </Col>
                <Col>
                  <Container>
                    <Row>
                      <Col>
                        <h4>Nombre de usuario</h4>
                        <p>{getInfo(data.username)}</p>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <h4>Registrado el</h4>
                        <p>{getInfo(getDate(data.date_joined))}</p>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <h4>Nombre completo</h4>
                        <p>{getInfo(data.name)}</p>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <h4>Género</h4>
                        <p>
                          {getInfo(data.gender) == 'm'
                            ? 'Masculino'
                            : getInfo(data.gender) == 'f'
                            ? 'Femenino'
                            : getInfo(data.gender) == 'o'
                            ? 'Otro/Prefiere no especificar'
                            : getInfo(data.gender)}
                        </p>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <h4>Año de nacimiento</h4>
                        <p>{getInfo(data.year_of_birth)}</p>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <h4>País de residencia</h4>
                        <p>{getInfo(data.country)}</p>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <h4>Correo electrónico</h4>
                        <p>{getInfo(data.email)}</p>
                      </Col>
                    </Row>
                  </Container>
                </Col>
              </Row>
              <Row>
                <Col>
                  <p style={{ textAlign: 'center', fontStyle: 'italic' }}>
                    La información podría no estar actualizada. Datos
                    correspondientes al día {getInfo(getDate(data.last_update))}
                  </p>
                </Col>
              </Row>
            </Fragment>
          ) : (
            <Row>
              <Col>
                {errors.map((e, k) => (
                  <Alert variant="warning" key={k}>
                    {e}
                  </Alert>
                ))}
              </Col>
            </Row>
          )}
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton>Cerrar</ModalDialog.CloseButton>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </Fragment>
  );
};

StudentInfoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  doToggle: PropTypes.func.isRequired,
  data: PropTypes.shape({
    username: PropTypes.string,
    date_joined: PropTypes.string,
    name: PropTypes.string,
    gender: PropTypes.string,
    year_of_birth: PropTypes.string,
    country: PropTypes.string,
    email: PropTypes.string,
  }),
  errors: PropTypes.array.isRequired,
};

export default StudentInfoModal;
