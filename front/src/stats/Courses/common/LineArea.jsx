import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label,
} from 'recharts';
import ColorGenerator from './ColorGenerator';
import CustomTooltip from './CustomTooltip';
import CustomTick from './CustomTick';
import PropTypes from 'prop-types';
/**
 * LineArea
 * Display an area chart.
 * Supports a tick parser function.
 *
 * xKey is the key of the value to be plotted on the X-Axis (e.g. time).
 * xLabel and yLabel are the labels of each axis (e.g. Time and Speed).
 * xProps and yProps are properties of each axis (e.g. stroke).
 * tooltip is an dictionary that contains a title, body and order keys
 * to define the customized tooltip. Body is used to obtain yKeys and
 * plot Y-Axis bars.
 * @param {Object} props
 * @returns
 */
const LineArea = ({
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
        <CartesianGrid strokeDasharray="3 3" />
        <Legend
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{
            bottom: '0px',
            lineHeight: '40px',
          }}
          iconType="line"
        />
        {yKeys.map((data_k, k) => (
          <Area
            dataKey={data_k}
            key={k}
            type="monotone"
            stroke={colors[k]}
            fill={colors[k]}
            activeDot={{ r: 8 }}
          />
        ))}
        )
      </AreaChart>
    </ResponsiveContainer>
  );
};

LineArea.propTypes = {
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

export default LineArea;
