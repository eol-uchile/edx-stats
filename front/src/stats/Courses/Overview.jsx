import React, { PureComponent } from 'react';
import {
  Container,
  Row,
  Col,
  Breadcrumb,
  ListGroup,
  ListGroupItem,
} from 'react-bootstrap';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { bindActionCreators } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { course, actions } from './data/actions';
import { getMyCourses, getHasCourses } from './data/selectors';
import { Spinner, Form, Button, Alert, Card, Collapsible } from '@edx/paragon';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useLanding } from './hooks';
import Select from 'react-select';
import CountUp from 'react-countup';
import userIcon from './assets/user_original.png';
import clockIcon from './assets/clock_original.png';
import eyeIcon from './assets/eye(1)_original.png';
import { useMediaQuery } from 'react-responsive';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Sector,
  AreaChart,
  Area,
  Cell,
} from 'recharts';

const data = [
  { name: 'Modulo 1: Aprendiendo redes con Javier', value: 400 },
  { name: 'Modulo 2: Estudiando Kubernetes con Felipe', value: 300 },
  { name: 'Modulo 3: Conquistando la educacion con EOL', value: 300 },
  { name: 'Modulo 4: Tomando cafe con Eolito', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

class ExamplePie extends PureComponent {
  static demoUrl =
    'https://codesandbox.io/s/pie-chart-with-customized-label-dlhhj';

  render() {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart width={400} height={400}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Legend verticalAlign="top" align="left" height={36} />
        </PieChart>
      </ResponsiveContainer>
    );
  }
}

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

class Example extends PureComponent {
  static demoUrl = 'https://codesandbox.io/s/simple-line-chart-kec3v';

  render() {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          width={500}
          height={300}
          data={dataline}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="Tiempo"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
          <Area type="monotone" dataKey="Visitas" stroke="#82ca9d" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
}

const countStyle = {
  textAlign: 'center',
  backgroundColor: '#0086d7',
  borderRadius: '0.375rem',
  border: '1px solid rgba(0, 0, 0, 0.125)',
  margin: '0.5rem 0',
  color: 'white',
};

const chartBox = {
  padding: '0.75rem 1.25rem',
  borderRadius: '0.375rem',
  border: '1px solid rgba(0, 0, 0, 0.125)',
  margin: '0.5rem 0',
  backgroundColor: '#def7ff',
};

const digitStyle = {
  fontWeight: 700,
  fontSize: '3em',
  fontFamily: 'mono',
};

const Overview = (props) => {
  const isShort = useMediaQuery({ maxWidth: 418 });
  const leftCount = !isShort
    ? { marginRight: '0.5rem' }
    : { margin: '0.5rem 0' };
  const rightCount = !isShort
    ? { marginLeft: '0.5rem' }
    : { margin: '0.5rem 0' };
  const bottomCount = { margin: '0.5rem 0' };
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
        <Col>
          <h4>Estado general</h4>
        </Col>
      </Row>
      <Row>
        <Col sm="12" lg="6">
          <Container className="container-fluid">
            <Row>
              <Col style={{ ...countStyle, ...leftCount }}>
                <img
                  src={eyeIcon}
                  alt="Visitas"
                  style={{ marginBottom: '1.5em', height: '3em' }}
                />
                <CountUp end={2327} duration={2.75} style={digitStyle} />
                <p style={{ fontSize: '1.2rem' }}>Visitas totales</p>
              </Col>
              <Col style={{ ...countStyle, ...rightCount }}>
                <img
                  src={userIcon}
                  alt="Usuarios"
                  style={{ marginBottom: '1.5em', height: '3em' }}
                />
                <CountUp end={32} duration={2.75} style={digitStyle} />
                <p style={{ fontSize: '1.2rem' }}>Usuarios registrados</p>
              </Col>
            </Row>
            <Row>
              <Col style={{ ...countStyle, ...bottomCount }}>
                <img
                  src={clockIcon}
                  alt="tiempo"
                  style={{ marginBottom: '1.5em', height: '3em' }}
                />
                <CountUp
                  start={10}
                  end={3243.012}
                  duration={2.75}
                  separator="."
                  decimals={0}
                  decimal=","
                  suffix=" min"
                  style={digitStyle}
                />
                <p style={{ fontSize: '1.2rem' }}>Tiempo visto estimado</p>
              </Col>
            </Row>
          </Container>
        </Col>
        <Col sm="12" lg="6">
          <ListGroup style={{ margin: '0.5rem 0' }}>
            <ListGroupItem style={{ backgroundColor: '#f2f2f2' }}>
              <h4>Consultar Analítica</h4>
            </ListGroupItem>
            <ListGroupItem>
              <Link to={`/courses/${'curso'}/times/${'start'}/${'end'}`}>
                Ver tiempo de vizualización general{' '}
                <FontAwesomeIcon
                  icon={faExternalLinkAlt}
                  className="float-right"
                />
              </Link>
              <p>Revisa donde los usuarios pasaron más tiempo en tu curso</p>
            </ListGroupItem>
            <ListGroupItem>
              <Link to={`/courses/${'curso'}/visits/${'start'}/${'end'}`}>
                Ver visitas por contenido{' '}
                <FontAwesomeIcon
                  icon={faExternalLinkAlt}
                  className="float-right"
                />
              </Link>
              <p>Monitorea que se está viendo y cuando</p>
            </ListGroupItem>
            <ListGroupItem>
              <a href="">
                Ver actividad por videos (Próximamente){' '}
                <FontAwesomeIcon
                  icon={faExternalLinkAlt}
                  className="float-right"
                />
              </a>
              <p>Observa como los estudiantes ven tus videos</p>
            </ListGroupItem>
          </ListGroup>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <div style={chartBox}>
            <h4>Actividad durante la semana</h4>
            <Example />
          </div>
        </Col>
        <Col md="6">
          <div style={chartBox}>
            <h4>Contenido visitado durante la semana</h4>
            <ExamplePie />
          </div>
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
        <Col></Col>
      </Row>
    </Container>
  );
};

Overview.propTypes = {};

export default Overview;
