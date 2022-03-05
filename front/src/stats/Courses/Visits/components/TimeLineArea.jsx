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
import PropTypes from 'prop-types';

const MAX_TOOLTIP = 4;

const CustomTooltip = ({ payload, label, active }, mapping) => {
  if (active) {
    let compareNumbers = (a, b) => b.value - a.value; // reversed
    let sorted = payload.sort(compareNumbers).slice(0, MAX_TOOLTIP);

    return (
      <div className="custom-tooltip">
        <p className="label">Fecha {label}</p>
        {sorted.map(
          (el) =>
            el.value > 0 && (
              <p key={el.dataKey}>
                {mapping[el.dataKey]}: {el.value}
              </p>
            )
        )}
        {payload.length > MAX_TOOLTIP && <p>...</p>}
      </div>
    );
  }

  return null;
};

const renderLegend = (value, entry, mapping) => {
  return <span>{mapping[value]}</span>;
};

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

/**
 * Reference 'https://codesandbox.io/s/stacked-area-chart-ix341'
 */
const TimeLineArea = ({
  data,
  xKey,
  xLabel,
  yLabel,
  xProps,
  yProps,
  tooltip,
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
        <Tooltip content={(arg) => CustomTooltip(arg, tooltip)} />
        <CartesianGrid strokeDasharray="3 3" />
        <Legend
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{
            bottom: '0px',
            lineHeight: '40px',
          }}
          iconType="square"
          formatter={(v, e) => renderLegend(v, e, tooltip)}
        />
        {yKeys.map((data_k, k) => (
          <Area
            dataKey={data_k}
            key={k}
            type="monotone"
            stroke={colors[k]}
            fill={colors[k]}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

TimeLineArea.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  xKey: PropTypes.string,
  xLabel: PropTypes.string,
  yLabel: PropTypes.string,
  xProps: PropTypes.object,
  yProps: PropTypes.object,
  tooltip: PropTypes.object,
  height: PropTypes.number,
  labelInTitle: PropTypes.bool,
};

export default TimeLineArea;
