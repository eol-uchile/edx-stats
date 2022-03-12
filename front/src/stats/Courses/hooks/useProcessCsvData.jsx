import React, { useEffect, useState } from 'react';

function useProcessCsvData(rowVerticals, keys) {
  const [table, setTable] = useState({
    headers: [],
    body: [],
  });

  useEffect(() => {
    let headers = [...Object.values(keys)];
    let body = [
      ...rowVerticals.map((data, k) => [
        ...Object.keys(keys).map((key) => data[key]),
      ]),
    ];

    setTable({ headers, body });
  }, [rowVerticals]);

  return table;
}

export default useProcessCsvData;
