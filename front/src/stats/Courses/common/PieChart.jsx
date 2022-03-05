import React, { useMemo } from 'react';
import {
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import { interpolateHsl } from 'd3-interpolate';
import PropTypes from 'prop-types';

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
  const radius = outerRadius + (outerRadius - innerRadius) * 0.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#8884d8"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function componentToHex(c) {
  var parsed = Number(c);
  var hex = parsed.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(rgb) {
  let c = rgb.slice(4, rgb.length - 1).split(',');
  return (
    '#' +
    componentToHex(c[0].trim()) +
    componentToHex(c[1].trim()) +
    componentToHex(c[2].trim())
  );
}

const PieChart = ({ data, xKey, height = 400 }) => {
  const colors = useMemo(() => {
    let len = data.length;
    let fun = interpolateHsl('red', 'blue');
    let interpolated = [];
    for (let index = 0; index < len; index++) {
      interpolated.push(rgbToHex(fun(index / len + 1)));
    }
    return interpolated;
  }, [data]);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RePieChart
        margin={{
          top: 10,
          right: 30,
          left: 30,
          bottom: 0,
        }}
      >
        <Legend
          verticalAlign="top"
          align="left"
          wrapperStyle={{
            lineHeight: '40px',
          }}
        />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey={xKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </RePieChart>
    </ResponsiveContainer>
  );
};

PieChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  xKey: PropTypes.string,
  height: PropTypes.number,
};

export default PieChart;
