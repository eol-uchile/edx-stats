import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from 'recharts';

const StackedBar = ({
  data,
  bar1_key,
  bar2_key,
  name_key,
  x_label,
  y_label,
}) => {
  return (
    <ResponsiveContainer width="100%" height={450}>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis dataKey={name_key} stroke="#8884d8">
          <Label value={x_label} offset={-10} position="insideBottom" />
        </XAxis>
        <YAxis label={{ value: y_label, angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <Legend
          wrapperStyle={{
            bottom: '0px',
            lineHeight: '40px',
          }}
          iconType="square"
        />
        <Bar stackId="a" dataKey={bar1_key} fill="#0086d7" />
        <Bar stackId="a" dataKey={bar2_key} fill="#b4b4b4" />
      </BarChart>
    </ResponsiveContainer>
  );
};
export default StackedBar;
