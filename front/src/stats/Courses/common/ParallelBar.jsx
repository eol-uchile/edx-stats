import React, { useMemo } from 'react';
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
import CustomTooltip from './CustomTooltip';
import PropTypes from 'prop-types';

const ParallelBar = ({
  data,
  xKey,
  xLabel,
  yLabel,
  xProps,
  yProps,
  tooltip,
  asc = false,
  height = 400,
  labelInTitle = true,
}) => {
  const yKeys = useMemo(() => {
    return Object.keys(tooltip);
  }, [tooltip]);
  const colors = ['#ffc500', '#00a9ff'];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
      >
        <XAxis dataKey={xKey} stroke="#8884d8" {...xProps}>
          <Label offset={-10} position="insideBottom" value={xLabel} />
        </XAxis>
        <YAxis {...yProps}>
          <Label angle={-90} position="insideLeft" value={yLabel} />
        </YAxis>
        <Tooltip
          content={(arg) => CustomTooltip(arg, tooltip, asc, labelInTitle)}
        />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <Legend
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{
            bottom: '0px',
            lineHeight: '40px',
          }}
          iconType="square"
        />
        {yKeys.map((data_k, k) => (
          <Bar
            dataKey={data_k}
            key={k}
            type="monotone"
            barSize={30}
            fill={colors[k]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

ParallelBar.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  xKey: PropTypes.string,
  xLabel: PropTypes.string,
  yLabel: PropTypes.string,
  xProps: PropTypes.object,
  yProps: PropTypes.object,
  tooltip: PropTypes.object,
  asc: PropTypes.bool,
  height: PropTypes.number,
  labelInTitle: PropTypes.bool,
};

export default ParallelBar;
