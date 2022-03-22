import React from 'react';
import PropTypes from 'prop-types';

const MAX_TOOLTIP = 4;
/**
 * Display a custom message when the mouse hovers over a point/line/bar
 * on the chart.
 *
 * title can contain the string '{}' to include xKey value (e.g. 'Time[s] {}').
 * body must be a dictionary containing the key of the values
 * to be plotted on the Y-Axis and its label as value. Supports parser functions.
 * (e.g. Speed: {
 *      label: 'At this instant of time, the speed is {} [km/h]',
 *      parser: parserMsToKmh
 * }).
 * order property orders the body according to key (default, reversed) or value (asc, dec).
 * @param {Object} data
 * @param {Object} tooltipDictionary
 * @returns
 */
function CustomTooltip(
  { payload, label, active },
  { title = '', body, order = '' }
) {
  if (active) {
    let sorted = [];
    switch (order) {
      case 'reversed':
        sorted = payload.reverse();
        break;
      case 'asc':
        sorted = payload.sort((a, b) => a.value - b.value);
        break;
      case 'dec':
        sorted = payload.sort((a, b) => b.value - a.value);
        break;
      default:
        sorted = payload;
    }
    let sliced = sorted.slice(0, MAX_TOOLTIP);
    return (
      <div className="custom-tooltip">
        <p className="label">
          {title.replace('{}', label)}{' '}
          {payload[0] && payload[0].payload.tooltip}
        </p>
        {sliced.map(
          (el) =>
            el.value > 0 && (
              <p key={el.dataKey}>
                {body[el.dataKey].label.replace(
                  '{}',
                  body[el.dataKey].parser
                    ? body[el.dataKey].parser(el.value)
                    : el.value
                )}
              </p>
            )
        )}
        {payload.length > MAX_TOOLTIP && <p>...</p>}
      </div>
    );
  }

  return null;
}

CustomTooltip.PropTypes = {
  arg: PropTypes.shape({
    payload: PropTypes.array.isRequired,
    label: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
  }).isRequired,
  tooltip: PropTypes.shape({
    title: PropTypes.string,
    body: PropTypes.object.isRequired,
    order: PropTypes.string,
  }).isRequired,
};

export default CustomTooltip;
