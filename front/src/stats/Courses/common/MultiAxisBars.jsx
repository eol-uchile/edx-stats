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
  Text,
} from 'recharts';
import { parseFloatToTimeString } from '../helpers';
import PropTypes from 'prop-types';

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
          Tiempo total: {payload[0] && parseFloatToTimeString(payload[0].value)}
          .
        </p>
        <p className="second">
          {payload[1] && payload[1].value} estudiantes vieron el contenido.
        </p>
      </div>
    );
  }

  return null;
}

const MultiAxisBars = ({
  data,
  xKey,
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
  const colors = ['#5b68dd', '#ff8949'];
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
          tick={<CustomizedTick />}
        >
          <Label angle={-90} position="insideLeft" value={yLabel[0]} />
        </YAxis>
        <YAxis domain={[0, 'dataMax']} yAxisId="right" orientation="right">
          <Label angle={90} position="insideRight" value={yLabel[1]} />
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
  xKey: PropTypes.string,
  xLabel: PropTypes.string,
  yLabel: PropTypes.arrayOf(PropTypes.string),
  xProps: PropTypes.object,
  yProps: PropTypes.arrayOf(PropTypes.object),
  tooltip: PropTypes.object,
  asc: PropTypes.bool,
  height: PropTypes.number,
  labelInTitle: PropTypes.bool,
};

export default MultiAxisBars;
