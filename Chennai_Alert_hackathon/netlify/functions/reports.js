'use strict';

const fs = require('fs');
const path = require('path');

const FILE = path.join(process.env.NETLIFY_FUNCTIONS_CACHE_DIR || process.cwd(), 'reports-store.json');
const CELL_DEG = 0.0045;
const REPORT_WINDOW_MS = 3 * 60 * 60 * 1000;
const OVERLAP_THRESHOLD = 3;

function readStore() {
  try {
    if (!fs.existsSync(FILE)) return { reports: [] };
    const raw = fs.readFileSync(FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.reports)) return parsed;
  } catch (e) {
    // corrupt store → start fresh
  }
  return { reports: [] };
}

function writeStore(store) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(store, null, 0), 'utf8');
  } catch (e) {
    // storage failure — fail the response, do not swallow
    throw e;
  }
}

function now() {
  return Date.now();
}

function sameCell(a, b) {
  return Math.round(a.lat / CELL_DEG) === Math.round(b.lat / CELL_DEG) &&
    Math.round(a.lng / CELL_DEG) === Math.round(b.lng / CELL_DEG);
}

function revealOverlaps(store, report) {
  const matches = store.reports.filter(function (r) {
    return now() - r.t < REPORT_WINDOW_MS && sameCell(r, report);
  });
  if (matches.length >= OVERLAP_THRESHOLD) {
    matches.forEach(function (r) { r.visible = true; });
  }
}

function baseReport(body) {
  return {
    id: 'r' + now() + Math.random().toString(36).slice(2, 7),
    lat: Number(body.lat),
    lng: Number(body.lng),
    type: String(body.type || 'other'),
    note: String(body.note || '').slice(0, 140),
    t: now(),
    status: 'pending',
    visible: false
  };
}

exports.handler = async function (event) {
  const method = event.httpMethod || event.method;
  const query = event.queryStringParameters || {};
  const secret = query.secret || event.headers['x-admin-secret'] || '';

  const validSecret = process.env.SECRET_TOKEN || '';
  const checkSecret = (allowed) => {
    if (!allowed) return true; // public endpoint
    if (!validSecret) return false;
    return secret === validSecret;
  };

  try {
    if (method === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: corsHeaders()
      };
    }

    if (method === 'POST' && event.path.endsWith('/reports')) {
      if (!checkSecret(false)) {
        return { statusCode: 401, body: 'unauthorized' };
      }
      let body = {};
      try {
        body = JSON.parse(event.body || '{}');
      } catch (e) {
        return { statusCode: 400, body: 'invalid json' };
      }

      const store = readStore();
      const r = baseReport(body);
      if (isNaN(r.lat) || isNaN(r.lng)) {
        return { statusCode: 400, body: 'lat and lng required' };
      }
      store.reports.unshift(r);
      revealOverlaps(store, r);
      writeStore(store);

      return {
        statusCode: 201,
        headers: corsHeaders(),
        body: JSON.stringify(r)
      };
    }

    if (method === 'GET' && event.path.endsWith('/reports')) {
      if (!checkSecret(true)) {
        return { statusCode: 401, body: 'unauthorized' };
      }
      const store = readStore();
      const statusFilter = (query.status || '').trim().toLowerCase();

      let list = store.reports.filter(function (r) { return r.visible === true; });
      if (statusFilter === 'pending' || statusFilter === 'accepted' || statusFilter === 'declined') {
        list = list.filter(function (r) { return r.status === statusFilter; });
      }

      list = list.slice().sort(function (a, b) { return b.t - a.t; });

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({
          reports: list,
          updated: now()
        })
      };
    }

    const acceptMatch = event.path.match(/^\/reports\/([^/]+)\/accept$/);
    if (method === 'POST' && acceptMatch) {
      if (!checkSecret(true)) {
        return { statusCode: 401, body: 'unauthorized' };
      }
      const id = acceptMatch[1];
      const store = readStore();
      const found = store.reports.find(function (r) { return r.id === id; });
      if (!found) {
        return { statusCode: 404, body: 'not found' };
      }
      found.status = 'accepted';
      found.seen = now();
      writeStore(store);
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ ok: true, id: id })
      };
    }

    const declineMatch = event.path.match(/^\/reports\/([^/]+)\/decline$/);
    if (method === 'POST' && declineMatch) {
      if (!checkSecret(true)) {
        return { statusCode: 401, body: 'unauthorized' };
      }
      const id = declineMatch[1];
      const store = readStore();
      const found = store.reports.find(function (r) { return r.id === id; });
      if (!found) {
        return { statusCode: 404, body: 'not found' };
      }
      found.status = 'declined';
      found.seen = now();
      writeStore(store);
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ ok: true, id: id })
      };
    }

    return { statusCode: 404, body: 'not found' };
  } catch (e) {
    return { statusCode: 500, body: 'store error' };
  }
};

function corsHeaders() {
  const origin = process.env.CORS_ORIGIN || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Secret',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
}
