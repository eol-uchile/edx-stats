import React from 'react';

const parseToTableRows = (r, k, parse, classRuling = () => '') => (
  <tr key={'row' + k}>
    {r.map((d, kd) => (
      <td key={kd} className={classRuling(d)}>
        {parse(d)}
      </td>
    ))}
  </tr>
);

const parseFloatToTimeString = (seconds) => {
  if (typeof seconds != 'number') {
    return seconds;
  }
  let secs = `${Math.floor(seconds % 60)}`;
  let mins = `${Math.floor(seconds / 60) % 60}`;
  let hours = Math.floor(seconds / 3600);
  if (hours > 0) {
    return `${hours}:${mins.length === 1 ? '0' + mins : mins}:${
      secs.length === 1 ? '0' + secs : secs
    }`;
  }
  return `${mins.length === 1 ? '0' + mins : mins}:${
    secs.length === 1 ? '0' + secs : secs
  }`;
};

export { parseFloatToTimeString, parseToTableRows };
