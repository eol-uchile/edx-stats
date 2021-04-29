// test/server.js

import { rest } from 'msw';

import { setupServer } from 'msw/node';

import { handlers } from './server-handlers';

const server = setupServer(...handlers);

const lms_url = process.env.LMS_BASE_URL;
const base_url = process.env.BASE_URL;
const cms_url = process.env.CMS_BASE_URL;
const discovery_url = process.env.DISCOVERY_API_BASE_URL;
const urls = { lms_url, base_url, cms_url, discovery_url };

export { server, rest, urls };
