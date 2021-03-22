import React, { useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { dismissMessage, getMessages } from './data/actions';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import './Message.css';
import { Container, Row, Col } from 'react-bootstrap';

const Message = ({ getMessages, messages, dismiss }) => {
  useEffect(() => {
    let d = new Date();
    d.setMonth(d.getMonth() - 1);
    getMessages(d);
  }, [getMessages]);

  return (
    <div className="stat-messages">
      {messages.map((el) => (
        <Alert
          variant={el.variant}
          dismissible={el.dismissable}
          onClose={() => {
            dismiss(el.id);
          }}
          key={el.id}
        >
          <Container>
            <Row>
              <Col>
                <Alert.Heading>{el.title}</Alert.Heading>
                {el.message}
              </Col>
            </Row>
          </Container>
        </Alert>
      ))}
    </div>
  );
};

Message.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      message: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
    })
  ).isRequired,
  dismiss: PropTypes.func.isRequired,
  getMessages: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  messages: state.messages.messages,
});

const mapActionsToProps = (dispatch) => ({
  dismiss: (id) => dispatch(dismissMessage(id)),
  getMessages: (date) => dispatch(getMessages(date)),
});

export default connect(mapStateToProps, mapActionsToProps)(Message);
