import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const StackedArea = ({
  data,
  bar1_key,
  bar2_key,
  name_key,
  x_label,
  y_label,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        width={500}
        height={400}
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={name_key} stroke="#8884d8">
          <Label value={x_label} offset={-10} position="insideBottom" />
        </XAxis>
        <YAxis label={{ value: y_label, angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Area type='monotone' dataKey={bar1_key} stackId="1" stroke="#76bcef" fill="#76bcef" />
        <Area type='monotone' dataKey={bar2_key} stackId="1" stroke="#5b68dd" fill="#5b68dd" />
      </AreaChart>
    </ResponsiveContainer>
  );
};
export default StackedArea;
