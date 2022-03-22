import React from 'react';
import { Text } from 'recharts';
import PropTypes from 'prop-types';
/**
 * Create a Customized Tick for Axis.
 * Supports a parser function.
 * @param {Object} props
 * @param {Function} parser
 * @returns
 */
function CustomTick(props, parser) {
  const { payload } = props;
  return (
    <Text {...props}>{parser ? parser(payload.value) : payload.value}</Text>
  );
}

CustomTick.PropTypes = {
  props: PropTypes.shape({
    fill: PropTypes.string.isRequired,
    height: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    payload: PropTypes.shape({
      coordinate: PropTypes.number.isRequired,
      isShow: PropTypes.bool.isRequired,
      offset: PropTypes.number.isRequired,
      tickCoord: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
    }).isRequired,
    stroke: PropTypes.string.isRequired,
    textAnchor: PropTypes.string.isRequired,
    verticalAnchor: PropTypes.string.isRequired,
    visibleTickCount: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }),
  parser: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
};

export default CustomTick;
