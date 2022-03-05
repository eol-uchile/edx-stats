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

const CustomizedTick = (props) => {
  const { payload } = props;
  return <Text {...props}>{parseFloatToTimeString(payload.value)}</Text>;
};

function CustomTooltip({ payload, label, active }, doLabel = false) {
  if (active) {
    return (
      <div className="custom-tooltip">
        <p className="label">
          {doLabel
            ? `${label} : ${payload[0] && payload[0].payload.tooltip}`
            : payload[0] && payload[0].payload.tooltip}
        </p>
        <p className="first">
          Tiempo promedio de visualización:{' '}
          {payload[0] && parseFloatToTimeString(payload[0].value)}
        </p>
        <p className="second">
          Desviación estándar:{' '}
          {payload[0] && parseFloatToTimeString(payload[0].payload.errorX)}
        </p>
      </div>
    );
  }

  return null;
}

const ErrorBarChart = ({
  data,
  xKey,
  errorKey,
  xLabel,
  yLabel,
  xProps,
  yProps,
  tooltip,
  asc = false,
  height = 400,
  labelInTitle = false,
}) => {
  const yKeys = useMemo(() => {
    return Object.keys(tooltip);
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
        <YAxis {...yProps}>
          <Label angle={-90} position="insideLeft" value={yLabel} />
        </YAxis>
        <Tooltip content={(arg) => CustomTooltip(arg, labelInTitle)} />
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
            dataKey={errorKey}
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
  tooltip: PropTypes.object,
  asc: PropTypes.bool,
  height: PropTypes.number,
  labelInTitle: PropTypes.bool,
};

export default ErrorBarChart;
