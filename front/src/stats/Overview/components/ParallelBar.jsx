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

function CustomTooltip({ payload, label, active }, doLabel = false) {
  if (active) {
    return (
      <div className="custom-tooltip">
        <p className="label">
          {doLabel
            ? `${label} : ${payload[0] && payload[0].payload.tooltip}`
            : payload[0] && payload[0].payload.tooltip}
        </p>
        <p className="views">
          Visitas totales: {payload[1] && payload[1].value}.
        </p>
        <p className="students">
          {payload[0] && payload[0].value} estudiantes vieron el contenido.
        </p>
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
  tooltipLabel = false,
}) => (
  <ResponsiveContainer width="100%" height={450}>
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
          backgroundColor: '#f5f5f5',
          border: '1px solid #d5d5d5',
          borderRadius: 3,
          lineHeight: '40px',
        }}
      />
      <Bar dataKey={bar1_key} fill="#82ca9d" barSize={30} />
      <Bar type="monotone" dataKey={bar2_key} fill="#8884d8" barSize={30} />
    </BarChart>
  </ResponsiveContainer>
);

ParallelBar.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      students: PropTypes.number,
      visits: PropTypes.number,
      tooltip: PropTypes.string.isRequired,
      val: PropTypes.string.isRequired,
      id: PropTypes.string,
    })
  ),
  bar1_key: PropTypes.string.isRequired,
  bar2_key: PropTypes.string.isRequired,
  name_key: PropTypes.string.isRequired,
  x_label: PropTypes.string.isRequired,
  y_label: PropTypes.string.isRequired,
};

export default ParallelBar;
