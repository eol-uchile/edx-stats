import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { std, mean } from 'mathjs';

const addDiv = (a, b) => {
  let x = a.split('/');
  let y = b.split('/');
  let numerator = parseInt(x[0]) + parseInt(y[0]);
  let denominator = parseInt(x[1]) + parseInt(y[1]);
  return `${numerator}/${denominator}`;
};

/**
 * Compute and parse course data into headers, rows and plot information
 */
function useProcessSumCompletion(
  tableData,
  sum,
  sum_key,
  recoverSum,
  errors,
  setErrors,
  upperDate,
  lowerDate
) {
  const course = useSelector((state) => state.course);

  // Course Sum data
  const [rowData, setRowData] = useState({
    all: [],
    chapters: [],
    //verticals: [],
    //grouped_verticals: [],
    loaded: false,
  });

  /** Recover incoming data for table.
   *
   *  Compute indices like 1.1.2 using the structure from
   *  the LMS. Use the indices and sizes to prepare columns
   *  with colSpans on a table.
   *
   *  Finally ask for sums
   */
  useEffect(() => {
    if (course.course.length !== 0) {
      let current = course.course[0];
      // Load sum
      recoverSum(current.id, new Date(lowerDate), new Date(upperDate));
    }
    // eslint-disable-next-line
  }, [course.course]);

  // Parse visits as rows
  useEffect(() => {
    if (tableData.loaded && sum.length !== 0 && errors.length === 0) {
      let rows = [];
      let users = {};
      let chapterRow = [];
      // for RadialBar
      let verticals = {}; // {students, completed, name, id}
      let grouped_verticals = []; // {students, completed}
      // Group by username
      sum.map((t) => {
        if (t.username in users) {
          users[t.username].push(t);
        } else {
          users[t.username] = [t];
        }
      });

      // Get chapters length
      let subtotalsIndex = [];
      tableData.chapters.forEach((el, k) => {
        let sum = el.subtotal;
        if (subtotalsIndex[k - 1]) {
          sum = sum + subtotalsIndex[k - 1];
        }
        subtotalsIndex.push(sum);
      });
      // Map Rows with verticals
      Object.keys(users).forEach((u, k) => {
        // Fill array with zeros/blocksPerVertical
        let values = [];
        for (let i = 0; i < tableData.all; i++) {
          values.push(`0/${tableData.verticals[i].total_blocks}`);
        }
        // Fill positions with blocks visits
        for (let index = 0; index < users[u].length; index++) {
          if (tableData.mapping[users[u][index][sum_key]] !== undefined) {
            let vertical_index = tableData.mapping[users[u][index][sum_key]];
            let visited_blocks = users[u][index].completed;
            let total_blocks = tableData.verticals[vertical_index].total_blocks;
            values[vertical_index] = `${visited_blocks}/${total_blocks}`;

            // For verticals: Add 1 if user has completed current vertical
            let sum = 0;
            if (visited_blocks === total_blocks) {
              sum = 1;
            }
            // Check if verticals have info
            if (verticals[users[u][index][sum_key]] !== undefined) {
              verticals[users[u][index][sum_key]].completed =
                verticals[users[u][index][sum_key]].completed + sum;
              verticals[users[u][index][sum_key]].students =
                verticals[users[u][index][sum_key]].students + 1;
            } else {
              verticals[users[u][index][sum_key]] = {
                completed: sum,
                students: 1,
              };
            }
          }
        }
        // Put rows for all
        rows.push([u, ...values]);
        // Put each sub sum for each chapter
        let currentChapterRow = [u];
        subtotalsIndex.forEach((st, k) => {
          let leftIndex = subtotalsIndex[k - 1] ? subtotalsIndex[k - 1] : 0;
          let subArray = values.slice(leftIndex, st);
          let currentSum = subArray.reduce(addDiv, '0/0');
          currentChapterRow.push(currentSum);
        });
        chapterRow.push(currentChapterRow);
      });

      // For grouped_verticals
      // Process each chapter and add
      chapterRow.forEach((row_sum) => {
        row_sum.forEach((value, index) => {
          // First index 0 has student names
          if (index > 0) {
            let div = value.split('/');
            let visited_blocks = parseInt(div[0]);
            let total_blocks = parseInt(div[1]);
            if (grouped_verticals[index - 1]) {
              let div = value.split('/');
              if (visited_blocks === total_blocks) {
                grouped_verticals[index - 1].completed =
                  grouped_verticals[index - 1].completed + 1;
              }
            } else {
              grouped_verticals.push({
                completed: visited_blocks === total_blocks ? 1 : 0,
                students: chapterRow.length,
              });
            }
          }
        });
      });

      // Compute totals per vertical
      let named_verticals = tableData.verticals.map((vertical) => {
        let v_info = verticals[vertical.id]
          ? verticals[vertical.id]
          : { completed: 0, students: 0 };
        return {
          ...v_info,
          ...vertical,
        };
      });

      // Compute std deviation
      // Traverse rows
      // let vertical_errors = [];
      // for (let i = 1; i < rows[0].length; i++) {
      //   let user_v = rows.map((el) => el[i]);
      //   vertical_errors.push(std(user_v));
      // }

      // Compute std deviation
      // Traverse groups of rows
      // to create a matrix to compute std
      // NOTE: ignore index 1
      // let grouped_verticals_errors = [];
      // subtotalsIndex.forEach((st, k) => {
      //   let leftIndex = subtotalsIndex[k - 1] ? subtotalsIndex[k - 1] : 0;
      //   let subArray = rows.map((row) => row.slice(leftIndex + 1, st + 1));
      //   grouped_verticals_errors.push(std(subArray));
      // });

      setRowData({
        all: rows,
        chapters: chapterRow,
        verticals: named_verticals,
        grouped_verticals: grouped_verticals,
        //vertical_errors,
        //grouped_verticals_errors,
        loaded: true,
      });
      setErrors([]);
    }
  }, [tableData.loaded, sum]);

  useEffect(() => {
    if (errors.length > 0) {
      // If errors then reset the state
      setRowData({
        ...rowData,
        all: [],
        chapters: [],
        verticals: [],
        grouped_verticals: [],
        loaded: true,
      });
    }
  }, [errors]);

  return [rowData, setRowData];
}

export default useProcessSumCompletion;
