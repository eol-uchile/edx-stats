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
import PropTypes from 'prop-types';

function CustomTooltip({ payload, label, active }, mapping, labelInTitle) {
  if (active) {
    return (
      <div className="custom-tooltip">
        <p className="label">
          {labelInTitle ? label : ''}{' '}
          {payload[0]
            ? payload[0].payload.tooltip && payload[0].payload.tooltip
            : ''}
        </p>
        <p key={'Incompleto'}>
          {mapping['Incompleto']}: {payload[1].value}
        </p>
        <p key={'Completo'}>
          {mapping['Completo']}: {payload[0].value}
        </p>
      </div>
    );
  }

  return null;
}

const StackedBar = ({
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
  const colors = ['#1f73d4', '#b4b4b4'];
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
        <Tooltip content={(arg) => CustomTooltip(arg, tooltip, labelInTitle)} />
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

export default StackedBar;
