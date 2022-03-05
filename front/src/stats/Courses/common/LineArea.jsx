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
import { interpolateHsl } from 'd3-interpolate';
import CustomTooltip from './CustomTooltip';
import PropTypes from 'prop-types';

function componentToHex(c) {
  var parsed = Number(c);
  var hex = parsed.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(rgb) {
  let c = rgb.slice(4, rgb.length - 1).split(',');
  return (
    '#' +
    componentToHex(c[0].trim()) +
    componentToHex(c[1].trim()) +
    componentToHex(c[2].trim())
  );
}

const LineArea = ({
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
  const colors = useMemo(() => {
    let len = yKeys.length;
    let fun = interpolateHsl('red', 'blue');
    let interpolated = [];
    for (let index = 0; index < len; index++) {
      interpolated.push(rgbToHex(fun(index / len + 1)));
    }
    return interpolated;
  }, [yKeys]);
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
        <YAxis {...yProps}>
          <Label angle={-90} position="insideLeft" value={yLabel} />
        </YAxis>
        <Tooltip
          content={(arg) => CustomTooltip(arg, tooltip, asc, labelInTitle)}
        />
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

export default LineArea;
