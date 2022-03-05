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
import PropTypes from 'prop-types';

function CustomTooltip({ label, payload, active }, mapping) {
  if (active) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Minuto ${label}`}</p>
        <p key={'Repeticiones'}>
          {mapping['Repeticiones']}: {payload[1].value}
        </p>
        <p key={'Visualizaciones'}>
          {mapping['Visualizaciones']}: {payload[0].value}
        </p>
      </div>
    );
  }

  return null;
}

const StackedArea = ({
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
  const colors = ['#009bdd', '#1e658d'];
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
  data: PropTypes.arrayOf(
    PropTypes.shape({
      second: PropTypes.string,
      Visualizaciones: PropTypes.number,
      Repeticiones: PropTypes.number,
    })
  ),
  bar1_key: PropTypes.string.isRequired,
  bar2_key: PropTypes.string.isRequired,
  name_key: PropTypes.string.isRequired,
  y_label: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default StackedArea;
