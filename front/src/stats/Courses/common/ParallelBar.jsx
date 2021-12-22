import React from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from 'recharts';
import PropTypes from 'prop-types';

function CustomTooltip({ label, payload, active }, doLabel = false) {
  if (active) {
    return (
      <div className="custom-tooltip">
        <p className="label">
          {doLabel
            ? `${label} : ${payload[0] && payload[0].payload.tooltip}`
            : payload[0] && payload[0].payload.tooltip}
        </p>
        <p className="first">{`${payload[0].value} estudiantes vieron el contenido`}</p>
        <p className="second">{`Equivalente a ${payload[1].value} minutos.`}</p>
      </div>
    );
  }

  return null;
}

const ParallelBar = ({
  data,
  bar1_key,
  bar2_key,
  name_key,
  x_label,
  y_label,
  width = '100%',
  tooltipLabel = false,
}) => (
  <ResponsiveContainer width={width} height={450}>
    <BarChart data={data} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
      <XAxis dataKey={name_key} stroke="#8884d8">
        <Label value={x_label} offset={-10} position="insideBottom" />
      </XAxis>
      <YAxis label={{ value: y_label, angle: -90, position: 'insideLeft' }} />
      <Tooltip content={(arg) => CustomTooltip(arg, tooltipLabel)} />
      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
      <Legend
        wrapperStyle={{
          bottom: '0px',
          lineHeight: '40px',
        }}
        iconType="square"
      />
      <Bar type="monotone" dataKey={bar1_key} fill="#ffc500" barSize={30} />
      <Bar type="monotone" dataKey={bar2_key} fill="#00a9ff" barSize={30} />
    </BarChart>
  </ResponsiveContainer>
);

ParallelBar.propTypes = {
  bar1_key: PropTypes.string.isRequired,
  bar2_key: PropTypes.string.isRequired,
  name_key: PropTypes.string.isRequired,
  x_label: PropTypes.string.isRequired,
  y_label: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ParallelBar;
