import React, { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { ModalDialog, ActionRow, Avatar } from '@edx/paragon';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { parseStringToDMYDate as getDate } from '../helpers';

const StudentInfoModal = ({ isOpen, doToggle, data }) => {
  // const studentDetails = useSelector((state) => state.student);

  return (
    <div>
      {/* {studentDetails.status === 'loading' && !data.loaded ? (
        <Row>
          <Col style={{ textAlign: 'center' }}>
            <Spinner animation="border" variant="primary" />
          </Col>
        </Row>
      ) : data.loaded ? ( */}
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
          <Row>
            <Col style={{ textAlign: 'center' }}>
              <Avatar size="xxl" />
            </Col>
            <Col>
              <Container>
                <Row>
                  <Col>
                    <h4>Nombre de usuario</h4>
                    <p>{data.username}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <h4>Registrado el</h4>
                    <p>{getDate(data.date_joined)}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <h4>Nombre completo</h4>
                    <p>{data.name}</p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <h4>Género</h4>
                    <p>
                      {data.gender == 'm'
                        ? 'Masculino'
                        : data.gender == 'f'
                        ? 'Femenino'
                        : 'No especificado'}
                    </p>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <h4>Año de nacimiento</h4>
                    <p>{data.year_of_birth}</p>
                  </Col>
                </Row>
                <Row>
                    <Col>
                      <h4>País de residencia</h4>
                      <p>{data.country}</p>
                    </Col>
                  </Row>
                <Row>
                  <Col>
                    <h4>Correo electrónico</h4>
                    <p>{data.email}</p>
                  </Col>
                </Row>
              </Container>
            </Col>
          </Row>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton>Cerrar</ModalDialog.CloseButton>
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
      {/* ) : (
        <Row>
          <Col>Ha ocurrido un error</Col>
        </Row>
      )} */}
    </div>
  );
};

export default StudentInfoModal;
