import React from 'react';
import PropTypes from 'prop-types';

const MAX_TOOLTIP = 4;

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
