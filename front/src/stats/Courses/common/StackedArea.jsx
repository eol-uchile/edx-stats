import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Label,
  ResponsiveContainer,
} from 'recharts';

function CustomTooltip({ label, payload, active }) {
  if (active) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Minuto ${label}`}</p>
        <p className="first">{`${payload[1].value} estudiantes repitieron este segmento.`}</p>
        <p className="second">{`${payload[0].value} estudiantes vieron este segmento.`}</p>
      </div>
    );
  }

  return null;
}

const StackedArea = ({
  data,
  bar1_key,
  bar2_key,
  name_key,
  y_label,
  width = '100%',
}) => {
  return (
    <ResponsiveContainer width={width} height={450}>
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
        <XAxis dataKey={name_key} stroke="#8884d8" />
        <YAxis label={{ value: y_label, angle: -90, position: 'insideLeft' }} />
        <Tooltip content={(arg) => CustomTooltip(arg)} />
        <Area dataKey={bar1_key} stackId="1" stroke="#009bdd" fill="#009bdd" />
        <Area dataKey={bar2_key} stackId="1" stroke="#1e658d" fill="#1e658d" />
      </AreaChart>
    </ResponsiveContainer>
  );
};
export default StackedArea;
