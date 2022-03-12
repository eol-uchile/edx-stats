import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';
import ColorGenerator from './ColorGenerator';
import CustomTooltip from './CustomTooltip';
import CustomTick from './CustomTick';
import PropTypes from 'prop-types';

const StackedArea = ({
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
  const tickParser = useMemo(() => {
    return yProps && yProps.parser;
  }, [yProps]);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
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
        <YAxis tick={(props) => CustomTick(props, tickParser)} {...yProps}>
          <Label angle={-90} position="insideLeft" value={yLabel} />
        </YAxis>
        <Tooltip content={(arg) => CustomTooltip(arg, tooltip)} />
        {yKeys.map((data_k, k) => (
          <Area
            dataKey={data_k}
            key={k}
            stackId="a"
            type="monotone"
            fill={colors[k]}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

StackedArea.propTypes = {
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

export default StackedArea;
