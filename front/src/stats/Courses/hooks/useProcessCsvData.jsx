import React, { useEffect, useState } from 'react';
/**
 * Parse data in rows for csv file
 * Columns contains key-label pairs,
 * where key is used to get the value of a row
 * and label is used to be displayed in the header
 * @param {Array} rows
 * @param {Object} columns
 * @returns
 */
function useProcessCsvData(rows, columns) {
  const [table, setTable] = useState({
    headers: [],
    body: [],
  });

  useEffect(() => {
    let headers = [...Object.values(columns)];
    let body = [
      ...rows.map((col, k) => [...Object.keys(columns).map((key) => col[key])]),
    ];

    setTable({ headers, body });
  }, [rows]);

  return table;
}

export default useProcessCsvData;
