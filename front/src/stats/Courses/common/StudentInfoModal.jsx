import React, { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { ModalDialog, ActionRow, Avatar } from '@edx/paragon';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';

const StudentInfoModal = ({ isOpen, doToggle, data }) => {
  // Quizas mover selector al componente padre o poner aqui el hook
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
                      <h4>Nombre completo</h4>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <h4>Fecha de nacimiento</h4>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <h4>Correo electrónico</h4>
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
