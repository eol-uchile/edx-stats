import React, { useState, useEffect } from 'react';

function useProcessDailyData(
  dailySum,
  course,
  loadFunction,
  lowerDate,
  upperDate
) {
  const [state, setState] = useState({
    computing: false,
    sumByMonths: [],
    chapterKeys: [],
  });

  const dateToYearMonth = (d) => `${d.getFullYear()}-${d.getMonth()}`;
  const clean_hash = (text) => text.slice(text.indexOf('@chapter+block@') + 15);

  const getChapterMapping = (chapter) => {
    let mapping = {};
    chapter.forEach((element) => {
      mapping[clean_hash(element.id)] = element.name;
    });
    return mapping;
  };

  useEffect(() => {
    if (course.course.length > 0) {
      loadFunction(
        course.course[0].id,
        new Date(lowerDate),
        new Date(upperDate)
      );
    }
    setState({ ...state, computing: true });
  }, [course, lowerDate, upperDate]);

  /**
   * Create groups by month where
   * each element has a day, a chapter and a count
   */
  useEffect(() => {
    if (dailySum.length > 0 && course.course.length > 0 && state.computing) {
      // Base variables
      let first = new Date(dailySum[0].date);
      let last = new Date(dailySum[dailySum.length - 1].date);

      // Variables to iterate over dailySum
      let current_year = first.getFullYear();
      let current_month = first.getMonth();
      let groupByMonths = [{ date: dateToYearMonth(first), data: [] }];

      // Create an array of possible dates
      let available_dates = [];
      while (first <= last) {
        available_dates.push({
          date: first.toLocaleDateString('en-US'),
        });
        first.setDate(first.getDate() + 1);
      }

      // Consolidate daily sums
      let dailySumConsolidated = {};
      console.log(dailySum);
      dailySum.forEach((sum) => {
        let key = new Date(sum.date).toLocaleDateString('en-US');
        if (dailySumConsolidated[key]) {
          dailySumConsolidated[key][clean_hash(sum.chapter)] = sum.total;
        } else {
          dailySumConsolidated[key] = { [clean_hash(sum.chapter)]: sum.total };
        }
      });

      let chapter_mapping = getChapterMapping(course.course[0].chapters);
      let chapter_keys = Object.keys(chapter_mapping);
      let count = 0;

      // Map daily sums
      available_dates.forEach((current) => {
        // Count per chapter
        chapter_keys.forEach((el) => {
          current[el] =
            dailySumConsolidated[current.date] &&
            dailySumConsolidated[current.date][el]
              ? dailySumConsolidated[current.date][el]
              : 0;
        });
        let current_date = new Date(current.date);
        if (
          current_date.getFullYear() == current_year &&
          current_date.getMonth() == current_month
        ) {
          groupByMonths[count].data.push(current);
        } else {
          groupByMonths.push({
            date: dateToYearMonth(current_date),
            data: [],
          });
          count += 1;
          groupByMonths[count].data.push(current);
          current_year = current_date.getFullYear();
          current_month = current_date.getMonth();
        }
      });

      setState({
        computing: false,
        sumByMonths: groupByMonths,
        chapterKeys: chapter_mapping,
      });
    }
  }, [dailySum, course]);

  return [state, setState];
}

export default useProcessDailyData;
