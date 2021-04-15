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
  Text,
} from 'recharts';
import { parseFloatToTimeString } from '../helpers';
import PropTypes from 'prop-types';

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
          Tiempo total: {payload[0] && parseFloatToTimeString(payload[0].value)}
          .
        </p>
        <p className="students">
          {payload[1] && payload[1].value} estudiantes vieron el contenido.
        </p>
      </div>
    );
  }

  return null;
}

const MultiAxisBars = ({
  data,
  bar1_key,
  bar2_key,
  name_key,
  x_label,
  y1_label,
  y2_label,
  tooltipLabel = false,
  width = '100%',
}) => (
  <ResponsiveContainer width={width} height={450}>
    <BarChart data={data} margin={{ top: 5, right: 20, bottom: 30, left: 20 }}>
      <XAxis dataKey={name_key} stroke="#8884d8">
        <Label value={x_label} offset={-10} position="insideBottom" />
      </XAxis>
      <YAxis
        domain={[0, 'dataMax']}
        yAxisId="left"
        tick={<CustomizedTick />}
        label={{ value: y1_label, angle: -90, position: 'insideLeft' }}
      />
      <YAxis
        domain={[0, 'dataMax']}
        yAxisId="right"
        orientation="right"
        label={{ value: y2_label, angle: 90, position: 'insideRight' }}
      />
      <Tooltip content={(arg) => CustomTooltip(arg, tooltipLabel)} />
      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
      <Legend
        wrapperStyle={{
          bottom: '0px',
          lineHeight: '40px',
        }}
        iconType="square"
      />
      <Bar
        type="monotone"
        dataKey={bar1_key}
        stroke="#5b68dd"
        fill="#5b68dd"
        yAxisId="left"
        strokeWidth={2}
      />
      <Bar
        dataKey={bar2_key}
        fill="#ff8949"
        stroke="#ff8949"
        strokeWidth={2}
        yAxisId="right"
      />
    </BarChart>
  </ResponsiveContainer>
);

MultiAxisBars.propTypes = {
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
  y1_label: PropTypes.string.isRequired,
  y2_label: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default MultiAxisBars;
