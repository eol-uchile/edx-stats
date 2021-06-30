import React from 'react';
import { Container, Row, Col, Breadcrumb } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { Collapsible } from '@edx/paragon';
import { Link } from 'react-router-dom';
import userIcon from '../assets/user_original.png';
import clockIcon from '../assets/clock_original.png';
import eyeIcon from '../assets/eye(1)_original.png';
import { CountBox, ChartBox, Menu } from './components';
import { PieChart, LineArea } from '../common';
import PropTypes from 'prop-types';

const data = [
  { name: 'Modulo 1: Aprendiendo redes con Javier', value: 400 },
  { name: 'Modulo 2: Estudiando Kubernetes con Felipe', value: 300 },
  { name: 'Modulo 3: Conquistando la educacion con EOL', value: 300 },
  { name: 'Modulo 4: Tomando cafe con Eolito', value: 200 },
];

const dataline = [
  {
    name: '01-06-2021',
    Visitas: 4000,
    Tiempo: 2400,
    amt: 2400,
  },
  {
    name: '05-06-2021',
    Visitas: 3000,
    Tiempo: 1398,
    amt: 2210,
  },
  {
    name: '10-06-2021',
    Visitas: 2000,
    Tiempo: 9800,
    amt: 2290,
  },
  {
    name: '15-06-2021',
    Visitas: 2780,
    Tiempo: 3908,
    amt: 2000,
  },
  {
    name: '20-06-2021',
    Visitas: 1890,
    Tiempo: 4800,
    amt: 2181,
  },
  {
    name: '25-06-2021',
    Visitas: 2390,
    Tiempo: 3800,
    amt: 2500,
  },
  {
    name: '30-06-2021',
    Visitas: 3490,
    Tiempo: 4300,
    amt: 2100,
  },
];

const Overview = (props) => {
  return (
    <Container className="rounded-lg shadow-lg py-4 px-5 my-2">
      <Helmet>
        <title>Analítica EOL</title>
      </Helmet>
      <Row>
        <Col>
          <Breadcrumb className="eol-breadcrumb">
            <Link className="breadcrumb-item" to={`/courses/`}>
              <FontAwesomeIcon icon={faHome} /> General
            </Link>
            <Breadcrumb.Item
              href="#"
              active
            >{`Tiempos ${'cursos'}`}</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2 className="content-header">
            Página Principal: curso de prueba con un nombre muy largo que es
            claramente del cms
          </h2>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <CountBox
            end={3325}
            duration={2.75}
            image={eyeIcon}
            change={20}
            caption={'Visitas totales'}
          />
        </Col>
        <Col md={4}>
          <CountBox
            end={32}
            duration={2.75}
            image={userIcon}
            change={20}
            caption={'Usuarios Registrados'}
          />
        </Col>
        <Col md={4}>
          <CountBox
            end={32}
            duration={2.75}
            image={clockIcon}
            change={-40}
            caption={'Minutos vistos'}
            countUpProps={{
              start: 10,
              end: 3243.012,
              duration: 2.75,
              separator: '.',
              decimals: 0,
              decimal: ',',
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col lg="6">
          <ChartBox title={'Actividad durante la semana'}>
            <LineArea data={dataline} dataKey={'name'} />
          </ChartBox>
        </Col>
        <Col lg="6">
          <ChartBox title={'Contenido visitado durante la semana'}>
            <PieChart data={data} />
          </ChartBox>
        </Col>
      </Row>
      <Row>
        <Col>
          <Menu />
        </Col>
      </Row>
      <Row>
        <Col>
          <Collapsible styling="basic" title="Attribución de íconos">
            <div>
              Íconos atribuidos a{' '}
              <a href="https://www.freepik.com" title="Freepik">
                Freepik
              </a>{' '}
              de{' '}
              <a href="https://www.flaticon.com/" title="Flaticon">
                www.flaticon.com
              </a>
            </div>
            <div>
              Íconos atribuidos a{' '}
              <a href="" title="Kiranshastry">
                Kiranshastry
              </a>{' '}
              de{' '}
              <a href="https://www.flaticon.com/" title="Flaticon">
                www.flaticon.com
              </a>
            </div>
            <div>
              Íconos atribuidos a{' '}
              <a href="https://icon54.com/" title="Pixel perfect">
                Pixel perfect
              </a>{' '}
              de{' '}
              <a href="https://www.flaticon.com/" title="Flaticon">
                www.flaticon.com
              </a>
            </div>
          </Collapsible>
        </Col>
      </Row>
    </Container>
  );
};

Overview.propTypes = {};

const mapStateToProps = (state) => ({});

export default connect()(Overview);
