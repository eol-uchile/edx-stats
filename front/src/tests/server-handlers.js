// server-handlers.js

// this is put into here so I can share these same handlers between my tests

// as well as my development in the browser. Pretty sweet!

import { rest } from 'msw'; // msw supports graphql too!

import * as courses from './data/courses.json';
import * as enrollment from './data/course_enrollment.json';
import * as course_structure from './data/course_structure.json';
import * as course_times from './data/course_times.json';
import * as course_visits from './data/course_visits.json';
import * as course_daily_chapter_visits from './data/course_daily_chapter_visits.json';
import * as course_times_week from './data/course_times_week.json';
import * as course_visits_week from './data/course_visits_week.json';
import * as course_visits_mod from './data/course_visits_mod.json';
import * as course_visits_seq from './data/course_visits_seq.json';

const lms_url = process.env.LMS_BASE_URL;
const base_url = process.env.BASE_URL;
const cms_url = process.env.CMS_BASE_URL;
const discovery_url = process.env.DISCOVERY_API_BASE_URL;

const handlers = [
  rest.get(`${lms_url}/api/enrollment/v1/roles`, async (req, res, ctx) => {
    return res(ctx.json(enrollment));
  }),
  rest.get(`${discovery_url}/api/v1/course_runs/*`, async (req, res, ctx) => {
    let params = req.url.searchParams.get('keys');
    if (params === undefined) {
      // Recover all data
      return res(
        ctx.json({
          data: courses,
        })
      );
    }
    const results = courses.results.filter((el) => params.includes(el.key));
    return res(
      ctx.json({
        ...courses,
        results: results,
        count: results.length,
      })
    );
    // Filter by key
  }),
  rest.get(`${base_url}/api/core/course-structure/*`, async (req, res, ctx) => {
    let params = req.url.searchParams.get('search');
    if (params === undefined) {
      return res(ctx.status(400));
    }
    return res(ctx.json(course_structure));
  }),
  rest.get(`${base_url}/api/times/timeoncourse/*`, async (req, res, ctx) => {
    let course = req.url.searchParams.get('course');
    if (params === undefined) {
      return res(ctx.status(400));
    }
    return res(ctx.json(course_times));
  }),
  rest.get(`${base_url}/api/visits/visitsoncourse/*`, async (req, res, ctx) => {
    let course = req.url.searchParams.get('course');
    if (params === undefined) {
      return res(ctx.status(400));
    }
    return res(ctx.json(course_visits));
  }),
  rest.get(
    `${base_url}/api/times/visitsoncourse/daily/chapter/*`,
    async (req, res, ctx) => {
      let course = req.url.searchParams.get('course');
      if (params === undefined) {
        return res(ctx.status(400));
      }
      return res(ctx.json(course_daily_chapter_visits));
    }
  ),
  rest.get(`${base_url}/api/times/timeoncourse/overview/*`, async (req, res, ctx) => {
    let course = req.url.searchParams.get('course');
    if (params === undefined) {
      return res(ctx.status(400));
    }
    return res(ctx.json({ total_time: 532717 }));
  }),
  rest.get(`${base_url}/api/visits/visitsoncourse/overview/*`, async (req, res, ctx) => {
    let course = req.url.searchParams.get('course');
    if (params === undefined) {
      return res(ctx.status(400));
    }
    return res(ctx.json({
      total_visits: 1481,
    }));
  }),
  rest.get(`${base_url}/api/core/usersincourse/overview/*`, async (req, res, ctx) => {
    let course = req.url.searchParams.get('course');
    if (params === undefined) {
      return res(ctx.status(400));
    }
    return res(ctx.json({
      total_users: 32,
    }));
  }),
  rest.get(`${base_url}/api/times/timeoncourse/overview/detailed/*`, async (req, res, ctx) => {
    let course = req.url.searchParams.get('course');
    if (params === undefined) {
      return res(ctx.status(400));
    }
    return res(ctx.json({total_time: course_times_week}));
  }),
  rest.get(`${base_url}/api/visits/visitsoncourse/overview/detailed/*`, async (req, res, ctx) => {
    let course = req.url.searchParams.get('course');
    if (params === undefined) {
      return res(ctx.status(400));
    }
    return res(ctx.json({total_visits: {
      date: course_visits_week,
      module: course_visits_mod,
      seq: course_visits_seq
    }}));
  }),
  rest.get('', async (req, res, ctx) => {
    return res();
  }),
];

export { handlers };
