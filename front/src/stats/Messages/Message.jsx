import React, { useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { dismissMessage, getMessages } from './data/actions';
import { useSelector, useDispatch } from 'react-redux';

import './Message.css';
import { Container, Row, Col } from 'react-bootstrap';

const Message = () => {
  const messages = useSelector((state) => state.messages.messages);
  const dispatch = useDispatch();

  useEffect(() => {
    let d = new Date();
    d.setMonth(d.getMonth() - 1);
    dispatch(getMessages(d));
  }, [getMessages]);

  return (
    <div className="stat-messages">
      {messages.map((el) => (
        <Alert
          variant={el.variant}
          dismissible={el.dismissable}
          onClose={() => {
            dispatch(dismissMessage(el.id));
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

export default Message;
