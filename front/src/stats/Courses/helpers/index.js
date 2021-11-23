import React from 'react';

const parseToTableRows = (r, k, parse, classRuling = () => '', clickRuling) => (
  <tr key={'row' + k}>
    {r.map((d, kd) => (
      <td 
        key={kd} 
        className={classRuling(d)} 
        style={0 === kd && clickRuling ? { cursor: 'pointer', textDecoration: 'underline' } : {}} 
        onClick={0 === kd && clickRuling ? () => clickRuling(d) : undefined}
      >
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
    return `${hours}:${mins.length === 1 ? '0' + mins : mins}:${secs.length === 1 ? '0' + secs : secs
      }`;
  }
  return `${mins.length === 1 ? '0' + mins : mins}:${secs.length === 1 ? '0' + secs : secs
    }`;
};

const parseStringToYMDDate = (d) => {
  // Parse string to year-month-day format
  let date = new Date(d);
  let dd = String(date.getDate()).padStart(2, '0');
  let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

const parseStringToDMYDate = (d) => {
  // Parse string to day-month-year format
  let date = new Date(d);
  let dd = String(date.getDate()).padStart(2, '0');
  let mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

const classNameRuling = (data, l0, l1, l2) => {
  if (typeof data !== 'number') {
    return '';
  } else if (data === 0) {
    return 'data-table-coloring-zeros';
  } else if (data > l0 && data < l1) {
    return 'data-table-coloring-l0';
  } else if (data >= l1 && data < l2) {
    return 'data-table-coloring-l1';
  } else {
    return 'data-table-coloring-l2';
  }
};

const sortByColumn = (rows, column, reverse = false, strings = false) => {
  let mapping = {};
  // Create groups by value
  // hopefully they are all different
  let isStringSorting = column === 0 || strings;

  rows.forEach((r, k) => {
    let key = isStringSorting ? r[column].toLowerCase() : r[column];
    if (mapping[key] !== undefined) {
      mapping[key].push(k);
    } else {
      mapping[key] = [k];
    }
  });

  let sortedKeys = isStringSorting
    ? Object.keys(mapping).sort() // Sort strings
    : Object.keys(mapping).sort((a, b) => Number(a) - Number(b));

  if (reverse) {
    sortedKeys.reverse();
  }

  // For group insert into new array
  let sorted = [];
  sortedKeys.forEach((k) => {
    mapping[k].forEach((key) => {
      sorted.push(rows[key]);
    });
  });
  return sorted;
};

export {
  parseFloatToTimeString,
  parseToTableRows,
  parseStringToYMDDate,
  parseStringToDMYDate,
  classNameRuling,
  sortByColumn,
};
