import React, { useMemo } from 'react';
import {
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Tooltip,
} from 'recharts';
import PropTypes from 'prop-types';

const PieChart = ({ data, dataKey, areaProps, height = 300 }) => {
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
          name="tooltip"
        />
        <Legend
          iconSize={10}
          width={120}
          height={140}
          layout="vertical"
          verticalAlign="middle"
          align="right"
        />
        <Tooltip />
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

PieChart.propTypes = {
  data: PropTypes.array.isRequired,
  height: PropTypes.number,
};

export default PieChart;
