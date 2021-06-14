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
const TimeLineArea = ({ data, keys, mapping, height = '60%' }) => {
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
    <ResponsiveContainer width="100%" height={height} minHeight={400}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" angle={-10} />
        <YAxis
          label={{
            value: 'Visitas Totales',
            angle: -90,
            position: 'insideLeft',
          }}
        />
        <Tooltip content={(arg) => CustomTooltip(arg, mapping)} />
        {keys.map((data_k, k) => (
          <Area
            type="monotone"
            dataKey={data_k}
            stackId="1"
            stroke={colors[k]}
            fill={colors[k]}
            key={data_k}
          />
        ))}
        <Legend
          formatter={(v, e) => renderLegend(v, e, mapping)}
          wrapperStyle={{
            bottom: '0px',
            lineHeight: '40px',
          }}
          iconType="square"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

TimeLineArea.propTypes = {
  data: PropTypes.array.isRequired, // {hash1: count, hash2: count .... date: date}
  keys: PropTypes.arrayOf(PropTypes.string).isRequired,
  mapping: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default TimeLineArea;
