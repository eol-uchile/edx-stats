import React, { useMemo } from 'react';
import { interpolateHsl } from 'd3-interpolate';
import PropTypes from 'prop-types';

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
 * Generate n colors interpolated between red and blue
 * @param {Number} n
 * @returns
 */
function ColorGenerator(n) {
  const colors = useMemo(() => {
    let fun = interpolateHsl('red', 'blue');
    let interpolated = [];
    for (let index = 0; index < n; index++) {
      interpolated.push(rgbToHex(fun(index / n + 1)));
    }
    return interpolated;
  }, [n]);

  return colors;
}

ColorGenerator.PropTypes = {
  n: PropTypes.number.isRequired,
};

export default ColorGenerator;
