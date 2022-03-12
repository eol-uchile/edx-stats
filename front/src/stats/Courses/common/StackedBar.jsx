import React, { useMemo } from 'react';
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
import CustomTooltip from './CustomTooltip';
import ColorGenerator from './ColorGenerator';
import PropTypes from 'prop-types';

const StackedBar = ({
  data,
  xKey,
  xLabel,
  yLabel,
  xProps,
  yProps,
  tooltip,
  height = 400,
}) => {
  const yKeys = useMemo(() => {
    return Object.keys(tooltip.body);
  }, [tooltip]);
  const colors = ColorGenerator(yKeys.length);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 30,
          bottom: 0,
        }}
      >
        <XAxis dataKey={xKey} stroke="#8884d8" {...xProps}>
          <Label offset={-10} position="insideBottom" value={xLabel} />
        </XAxis>
        <YAxis {...yProps}>
          <Label angle={-90} position="insideLeft" value={yLabel} />
        </YAxis>
        <Tooltip content={(arg) => CustomTooltip(arg, tooltip)} />
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
            stackId="a"
            type="monotone"
            barSize={60}
            fill={colors[k]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

StackedBar.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  xKey: PropTypes.string.isRequired,
  xLabel: PropTypes.string,
  yLabel: PropTypes.string,
  xProps: PropTypes.object,
  yProps: PropTypes.object,
  tooltip: PropTypes.shape({
    title: PropTypes.string,
    body: PropTypes.shape({
      yKey: PropTypes.shape({
        label: PropTypes.string.isRequired,
        parser: PropTypes.func,
      }),
    }).isRequired,
    order: PropTypes.string,
  }).isRequired,
  height: PropTypes.number,
};

export default StackedBar;
