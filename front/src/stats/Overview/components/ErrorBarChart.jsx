import React from 'react';
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ErrorBar,
  Label,
  Bar,
  Text,
} from 'recharts';
import PropTypes from 'prop-types';
import { parseFloatToTimeString } from '../helpers';

const CustomizedTick = (props) => {
  const { payload } = props;
  return <Text {...props}>{parseFloatToTimeString(payload.value)}</Text>;
};

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
          Tiempo promedio de visualización:{' '}
          {payload[0] && parseFloatToTimeString(payload[0].value)}
        </p>
        <p className="views">
          Desviación estándar:{' '}
          {payload[0] && parseFloatToTimeString(payload[0].payload.errorX)}
        </p>
      </div>
    );
  }

  return null;
}

const ErrorBarChart = ({
  data,
  area_key,
  name_key,
  x_label,
  y_label,
  tooltipLabel = false,
}) => (
  <ResponsiveContainer width="100%" height={450}>
    <BarChart data={data} margin={{ top: 5, right: 20, bottom: 30, left: 20 }}>
      <XAxis dataKey={name_key} stroke="#8884d8">
        <Label value={x_label} offset={-10} position="insideBottom" />
      </XAxis>
      <YAxis
        tick={<CustomizedTick />}
        label={{ value: y_label, angle: -90, position: 'insideLeft' }}
      />
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
      <Bar
        type="monotone"
        dataKey={area_key}
        stroke="#5b68dd"
        fill="#5b68dd"
        strokeWidth={2}
      >
        <ErrorBar
          dataKey="errorX"
          width={4}
          strokeWidth={2}
          stroke="green"
          direction="y"
        />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

ErrorBarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      students: PropTypes.number,
      visits: PropTypes.number,
      tooltip: PropTypes.string.isRequired,
      val: PropTypes.string.isRequired,
      id: PropTypes.string,
    })
  ),
  area_key: PropTypes.string.isRequired,
  name_key: PropTypes.string.isRequired,
  x_label: PropTypes.string.isRequired,
  y_label: PropTypes.string.isRequired,
};

export default ErrorBarChart;
