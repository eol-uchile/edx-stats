import React, { Fragment, useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import userIcon from '../../assets/user_original.png';
import clockIcon from '../../assets/clock_original.png';
import eyeIcon from '../../assets/eye(1)_original.png';
import { CountBox } from '.';
import PropTypes from 'prop-types';

const CountBoxes = ({ stats }) => {
  const timeCountBox = useMemo(() => {
    let seconds = stats.times;
    let minutes = Math.floor(seconds / 60);
    return minutes;
  }, [stats.times]);
  return (
    <Fragment>
      <Row>
        <Col md={4}>
          <CountBox
            image={eyeIcon}
            change={20}
            caption={'Visitas totales'}
            countUpProps={{
              start: 0,
              end: stats.visits,
              duration: 2.75,
              separator: '.',
              decimals: 0,
              decimal: ',',
            }}
          />
        </Col>
        <Col md={4}>
          <CountBox
            image={userIcon}
            change={20}
            caption={'Usuarios registrados'}
            countUpProps={{
              start: 0,
              end: stats.users,
              duration: 2.75,
              separator: '.',
              decimals: 0,
              decimal: ',',
            }}
          />
        </Col>
        <Col md={4}>
          <CountBox
            image={clockIcon}
            change={20}
            caption={'Minutos vistos'}
            countUpProps={{
              start: 0,
              end: timeCountBox,
              duration: 2.75,
              separator: '.',
              decimals: 0,
              decimal: ',',
            }}
          />
        </Col>
      </Row>
    </Fragment>
  );
};

CountBoxes.propTypes = {
  stats: PropTypes.shape({
    times: PropTypes.number.isRequired,
    visits: PropTypes.number.isRequired,
    users: PropTypes.number.isRequired,
  }),
};

export default CountBoxes;
