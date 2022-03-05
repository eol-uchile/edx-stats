import React from 'react';
import PropTypes from 'prop-types';

const MAX_TOOLTIP = 4;

function CustomTooltip({ payload, label, active }, mapping, asc, labelInTitle) {
  if (active) {
    let compareNumbers = (a, b) =>
      asc ? a.value - b.value : b.value - a.value;
    let sorted = payload.sort(compareNumbers).slice(0, MAX_TOOLTIP);
    return (
      <div className="custom-tooltip">
        <p className="label">
          {labelInTitle ? label : ''}{' '}
          {payload[0]
            ? payload[0].payload.tooltip && payload[0].payload.tooltip
            : ''}
        </p>
        {sorted.map(
          (el) =>
            el.value > 0 && (
              <p key={el.dataKey}>
                {mapping[el.dataKey]}: {el.value}
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
  asc: PropTypes.bool.isRequired,
  mapping: PropTypes.object.isRequired,
  labelInTitle: PropTypes.bool.isRequired,
};

export default CustomTooltip;
