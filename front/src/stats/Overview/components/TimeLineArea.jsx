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
} from 'recharts';
import { interpolateHsl, interpolate } from 'd3-interpolate';
import PropTypes from 'prop-types';

const CustomTooltip = ({ payload, label, active }, mapping) => {
  if (active) {
    return (
      <div className="custom-tooltip">
        <p className="label">Fecha {label}</p>
        {payload.map((el) => (
          <p>
            {mapping[el.dataKey]}: {el.value}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const renderLegend = (value, entry, mapping) => {
  const { color } = entry;

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
const TimeLineArea = ({ data, keys, mapping }) => {
  const colors = useMemo(() => {
    let len = keys.length;
    let fun = interpolateHsl('red', 'blue');
    let interpolated = [];
    for (let index = 0; index < len; index++) {
      interpolated.push(rgbToHex(fun(index / len + 1)));
    }
    return interpolated;
  }, [keys]);
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        width={500}
        height={400}
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip content={(arg) => CustomTooltip(arg, mapping)} />
        {keys.map((data_k, k) => (
          <Area
            type="monotone"
            dataKey={data_k}
            stackId="1"
            stroke={colors[k]}
            fill={colors[k]}
          />
        ))}
        <Legend
          wrapperStyle={{
            bottom: '0px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #d5d5d5',
            borderRadius: 3,
            lineHeight: '40px',
          }}
          formatter={(v, e) => renderLegend(v, e, mapping)}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

TimeLineArea.propTypes = {};

export default TimeLineArea;
