import React, { useMemo } from 'react';
import {
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Tooltip,
} from 'recharts';
import PropTypes from 'prop-types';

function CustomTooltip({ label, payload, active }, doLabel = false) {
  if (active) {
    return (
      <div className="custom-tooltip">
        {/* <p className="label">
          {doLabel
            ? `${label} : ${payload[0] && payload[0].payload.tooltip}`
            : payload[0] && payload[0].payload.tooltip}
        </p> */}
        <p className="first">Probando</p>
        <p className="second">Seguno</p>
      </div>
    );
  }

  return null;
}

const PieChart = ({ data, height = 300, tooltipLabel = false }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadialBarChart
        width={730}
        height={250}
        innerRadius="10%"
        outerRadius="80%"
        data={data}
        startAngle={180}
        endAngle={0}
      >
        <RadialBar
          minAngle={15}
          label={{ fill: '#666', position: 'insideStart' }}
          background
          clockWise={true}
          dataKey="completed"
        />
        <Legend
          iconSize={10}
          width={120}
          height={140}
          layout="vertical"
          verticalAlign="middle"
          align="right"
        />
        <Tooltip content={(arg) => CustomTooltip(arg, tooltipLabel)} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

PieChart.propTypes = {
  data: PropTypes.array.isRequired,
  height: PropTypes.number,
};

export default PieChart;
