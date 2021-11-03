import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { std, mean } from 'mathjs';

const add = (a, b) => a + b;

/**
 * Compute and parse course data into headers, rows and plot information
 */
function useProcessSumData(
  sum,
  sum_key,
  recoverSum,
  errors,
  setErrors,
  upperDate,
  lowerDate
) {
  const course = useSelector((state) => state.course);

  // Courses info parsed
  const [tableData, setTableData] = useState({
    loaded: false,
    chapters: [],
    sequentials: [],
    verticals: [],
    mapping: [], // Vertical_ids to column index
    all: 0, // Column counter
    course_info: {},
  });

  // Course Sum data
  const [rowData, setRowData] = useState({
    all: [],
    chapters: [],
    verticals: [],
    grouped_verticals: [],
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
    if (true) {
      let current = {
        chapters: [
          {
            name: 'Cap1',
            sequentials: [
              {
                name: 'seq1',
                verticals: [
                  {
                    vertical_id:
                      'block-v1:UChile+LEIT01+2020_T3+type@vertical+block@00b59e8cfaac4b5088af188e85318163',

                    name: 'UNO',
                  },
                ],
              },
              {
                name: 'seq2',
                verticals: [
                  {
                    vertical_id:
                      'block-v1:UChile+LEIT01+2020_T3+type@vertical+block@117def145895447ab1929e37a002a288',

                    name: 'dos',
                  },
                ],
              },
            ],
          },
          {
            name: 'Cap2',
            sequentials: [
              {
                name: 'seq1',
                verticals: [
                  {
                    vertical_id:
                      'block-v1:UChile+LEIT01+2020_T3+type@vertical+block@231fd26ff2704d5a8f2a7ef08a891277',

                    name: 'tres',
                  },
                ],
              },
            ],
          },
          {
            name: 'Cap3',
            sequentials: [
              {
                name: 'seq1',
                verticals: [
                  {
                    vertical_id:
                      'block-v1:UChile+LEIT01+2020_T3+type@vertical+block@50d943fade514884a1c6859a429a4334',

                    name: 'cuatro',
                  },
                ],
              },
            ],
          },
          {
            name: 'Cap4',
            sequentials: [
              {
                name: 'seq1',
                verticals: [
                  {
                    vertical_id:
                      'block-v1:UChile+LEIT01+2020_T3+type@vertical+block@58757fca448b4337a4b86b64ca7713cf',

                    name: 'cinco',
                  },
                ],
              },
            ],
          },
          {
            name: 'Cap5',
            sequentials: [
              {
                name: 'seq1',
                verticals: [
                  {
                    vertical_id:
                      'block-v1:UChile+LEIT01+2020_T3+type@vertical+block@7335f24ec9cd4c9099facd57e9025b1c',

                    name: 'seis',
                  },
                ],
              },
            ],
          },
        ],
      };
      // Get all the numbers
      let chapters = [];
      let sequentials = [];
      let verticals = [];
      let mapping = {};
      let all = 0;
      current.chapters.forEach((ch, key_ch) => {
        let subtotal = 0;
        ch.sequentials.forEach((seq, key_seq) => {
          seq.verticals.forEach((vert, key_vert) => {
            verticals.push({
              id: vert.vertical_id,
              val: `${key_ch + 1}.${key_seq + 1}.${key_vert + 1}`,
              tooltip: vert.name,
            });
            // Store array position id for row mapping
            mapping[vert.vertical_id] = all;
            all += 1;
          });
          subtotal += seq.verticals.length;
          sequentials.push({
            total_verticals: seq.verticals.length,
            name: seq.name,
            val: `${key_ch + 1}.${key_seq + 1}`,
          });
        });
        chapters.push({ name: ch.name, subtotal });
      });

      setTableData({
        loaded: true,
        chapters,
        sequentials,
        verticals,
        mapping,
        all,
      });

      // Load sum
      //recoverSum(current.id, new Date(lowerDate), new Date(upperDate));
    }
    // eslint-disable-next-line
  }, [course.course]);

  // Parse visits as rows
  useEffect(() => {
    if (tableData.loaded && sum.length !== 0 && errors.length === 0) {
      let rows = [];
      let users = {};
      let chapterRow = [];
      let verticals = {}; // {students, views, name, id}
      let grouped_verticals = []; // {students, views}
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
      Object.keys(users).forEach((u) => {
        // Fill array with zeros
        let values = Array.from(Array(tableData.all), () => 0);
        // Fill positions with visit
        for (let index = 0; index < users[u].length; index++) {
          if (tableData.mapping[users[u][index][sum_key]] !== undefined) {
            values[tableData.mapping[users[u][index][sum_key]]] =
              users[u][index].total;

            // Check if verticals have info
            if (verticals[users[u][index][sum_key]] !== undefined) {
              verticals[users[u][index][sum_key]].visits =
                verticals[users[u][index][sum_key]].visits +
                users[u][index].total;
              verticals[users[u][index][sum_key]].students =
                verticals[users[u][index][sum_key]].students + 1;
            } else {
              verticals[users[u][index][sum_key]] = {
                visits: users[u][index].total,
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
          let currentSum = subArray.reduce(add, 0);
          currentChapterRow.push(currentSum);
        });
        chapterRow.push(currentChapterRow);
      });

      // Process each chapter and add
      chapterRow.forEach((row_sum) => {
        row_sum.forEach((sum, index) => {
          // First index 0 has student names
          if (index > 0 && grouped_verticals[index - 1]) {
            if (sum > 0) {
              grouped_verticals[index - 1].visits =
                grouped_verticals[index - 1].visits + sum;
              grouped_verticals[index - 1].students =
                grouped_verticals[index - 1].students + 1;
            }
          } else if (index > 0) {
            grouped_verticals.push({ visits: sum, students: sum > 0 ? 1 : 0 });
          }
        });
      });

      // Compute totals per vertical
      let named_verticals = tableData.verticals.map((vertical) => {
        let v_info = verticals[vertical.id]
          ? verticals[vertical.id]
          : { visits: 0, students: 0 };
        return {
          ...v_info,
          ...vertical,
        };
      });

      // Compute std deviation
      // Traverse rows
      let vertical_errors = [];
      for (let i = 1; i < rows[0].length; i++) {
        let user_v = rows.map((el) => el[i]);
        vertical_errors.push(std(user_v));
      }

      // Compute std deviation
      // Traverse groups of rows
      // to create a matrix to compute std
      // NOTE: ignore index 1
      let grouped_verticals_errors = [];
      subtotalsIndex.forEach((st, k) => {
        let leftIndex = subtotalsIndex[k - 1] ? subtotalsIndex[k - 1] : 0;
        let subArray = rows.map((row) => row.slice(leftIndex + 1, st + 1));
        grouped_verticals_errors.push(std(subArray));
      });

      setRowData({
        all: rows,
        chapters: chapterRow,
        verticals: named_verticals,
        grouped_verticals: grouped_verticals,
        vertical_errors,
        grouped_verticals_errors,
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

  return [tableData, setTableData, rowData, setRowData];
}

export default useProcessSumData;
