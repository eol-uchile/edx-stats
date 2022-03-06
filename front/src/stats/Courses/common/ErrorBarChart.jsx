import React, { useMemo } from 'react';
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ErrorBar,
  Label,
  Bar,
  Text,
} from 'recharts';
import PropTypes from 'prop-types';
import { parseFloatToTimeString } from '../helpers';

function CustomTooltip(
  { payload, label, active },
  { title = '', body, order = '' }
) {
  if (active) {
    return (
      <div className="custom-tooltip">
        <p className="label">
          {title.replace('{}', label)}{' '}
          {payload[0]
            ? payload[0].payload.tooltip && payload[0].payload.tooltip
            : ''}
        </p>
        {Object.keys(body).map((data_k, k) =>
          k === 0 ? (
            <p key={k}>
              {body[data_k]}: {parseFloatToTimeString(payload[0].value)}
            </p>
          ) : (
            <p key={k}>
              {body[data_k]}:{' '}
              {parseFloatToTimeString(payload[0].payload.errorX)}
            </p>
          )
        )}
      </div>
    );
  }

  return null;
}

const CustomizedTick = (props) => {
  const { payload } = props;
  return <Text {...props}>{parseFloatToTimeString(payload.value)}</Text>;
};

const ErrorBarChart = ({
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
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
      >
        <XAxis dataKey={xKey} stroke="#8884d8" {...xProps}>
          <Label offset={-10} position="insideBottom" value={xLabel} />
        </XAxis>
        <YAxis tick={<CustomizedTick />} {...yProps}>
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
        <Bar
          dataKey={yKeys[0]}
          key={0}
          type="monotone"
          barSize={120}
          fill="#5b68dd"
        >
          <ErrorBar
            dataKey={yKeys[1]}
            width={4}
            strokeWidth={2}
            stroke="green"
            direction="y"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

ErrorBarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  xKey: PropTypes.string,
  errorKey: PropTypes.string,
  xLabel: PropTypes.string,
  yLabel: PropTypes.string,
  xProps: PropTypes.object,
  yProps: PropTypes.object,
  tooltip: PropTypes.shape({
    title: PropTypes.string,
    body: PropTypes.object.isRequired,
    order: PropTypes.string,
  }).isRequired,
  height: PropTypes.number,
};

export default ErrorBarChart;
