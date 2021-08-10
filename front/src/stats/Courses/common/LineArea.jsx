import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import PropTypes from 'prop-types';

const LineArea = ({ data, dataKey, height = '60%' }) => {
  return (
    <ResponsiveContainer width="100%" height={height} minHeight={400}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={dataKey} angle={-10} />
        <YAxis
          label={{
            value: 'Cantidad Diaria',
            angle: -90,
            position: 'insideLeft',
          }}
        />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="Tiempo"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Area
          type="monotone"
          dataKey="Visitas"
          stroke="#82ca9d"
          activeDot={{ r: 8 }}
        />
        <Legend />
      </AreaChart>
    </ResponsiveContainer>
  );
};

LineArea.propTypes = {
  data: PropTypes.array.isRequired, // {hash1: count, hash2: count .... date: date}
  keys: PropTypes.arrayOf(PropTypes.string).isRequired,
  mapping: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default LineArea;
