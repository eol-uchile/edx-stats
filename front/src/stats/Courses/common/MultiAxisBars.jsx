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
import ColorGenerator from './ColorGenerator';
import CustomTooltip from './CustomTooltip';
import CustomTick from './CustomTick';
import PropTypes from 'prop-types';
/**
 * MultiAxisBars
 * Display a two-YAxis bar chart.
 * Supports a tick parser function for each Y-Axis.
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
const MultiAxisBars = ({
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
  const tickParsers = useMemo(() => {
    if (yProps) {
      return [yProps[0] && yProps[0].parser, yProps[1] && yProps[1].parser];
    }
    return [false, false];
  }, [yProps]);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 30, bottom: 0 }}>
        <XAxis dataKey={xKey} stroke="#8884d8" {...xProps}>
          <Label offset={-10} position="insideBottom" value={xLabel} />
        </XAxis>
        <YAxis
          domain={[0, 'dataMax']}
          yAxisId="left"
          orientation="left"
          tick={(props) => CustomTick(props, tickParsers[0])}
          {...(yProps && yProps[0])}
        >
          <Label angle={-90} position="insideLeft" value={yLabel[0]} />
        </YAxis>
        <YAxis
          domain={[0, 'dataMax']}
          yAxisId="right"
          orientation="right"
          tick={(props) => CustomTick(props, tickParsers[0])}
          {...(yProps && yProps[1])}
        >
          <Label angle={90} position="insideRight" value={yLabel[1]} />
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
            type="monotone"
            stroke={colors[k]}
            fill={colors[k]}
            yAxisId={k == 0 ? 'left' : 'right'}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

MultiAxisBars.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  xKey: PropTypes.string.isRequired,
  xLabel: PropTypes.string,
  yLabel: PropTypes.arrayOf(PropTypes.string),
  xProps: PropTypes.object,
  yProps: PropTypes.arrayOf(PropTypes.object),
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

export default MultiAxisBars;
