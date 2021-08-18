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

const LineArea = ({ data, dataKey, areaProps, height = '60%' }) => {
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
        <XAxis dataKey={dataKey[0]} angle={-10} />
        <YAxis
          label={{
            value: dataKey[1],
            angle: -90,
            position: 'insideLeft',
          }}
        />
        <Tooltip />
        <Area {...areaProps[0]} />
        <Area {...areaProps[1]} />
        <Legend />
      </AreaChart>
    </ResponsiveContainer>
  );
};

LineArea.propTypes = {
  data: PropTypes.array.isRequired, // [{x_k: x_v, y1_k: y1_v, y2_k: y2_v}, ...]
  dataKey: PropTypes.arrayOf(PropTypes.string).isRequired, // [x_k, y label]
  areaProps: PropTypes.arrayOf(PropTypes.object).isRequired, // [{type, y1_k, stroke, fill, activeDot}, {type, y2_k, stroke, fill, activeDot}
};

export default LineArea;
