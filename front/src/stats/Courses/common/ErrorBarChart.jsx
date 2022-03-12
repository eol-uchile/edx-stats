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
import { parseFloatToTimeString } from '../helpers';
import ColorGenerator from './ColorGenerator';
import PropTypes from 'prop-types';

function CustomTooltip(
  { payload, label, active },
  { title = '', body, order = '' }
) {
  if (active) {
    return (
      <div className="custom-tooltip">
        <p className="label">
          {title.replace('{}', label)}{' '}
          {payload[0] && payload[0].payload.tooltip}
        </p>
        {Object.keys(body).map((data_k, k) => (
          <p key={k}>
            {body[data_k].label.replace(
              '{}',
              k === 0
                ? body[data_k].parser
                  ? body[data_k].parser(payload[0].value)
                  : payload[0].value
                : body[data_k].parser
                ? body[data_k].parser(payload[0].payload.errorX)
                : payload[0].payload.errorX
            )}
          </p>
        ))}
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
  const colors = ColorGenerator(yKeys.length);
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
          fill={colors[0]}
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
  xKey: PropTypes.string.isRequired,
  errorKey: PropTypes.string,
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

export default ErrorBarChart;
