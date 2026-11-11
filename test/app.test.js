const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const app = require('../app');
const { version } = require('../package.json');

let server;
let base;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

test('home page responds with the release version and a current server timestamp', async () => {
  const start = Date.now();
  const response = await fetch(base);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const html = await response.text();
  assert.ok(html.includes(version));
  assert.match(html, /href="\/health"/);
  const match = html.match(/datetime="([^"]+)"/);
  assert.ok(match, 'page contains a timestamp');
  assert.ok(Date.parse(match[1]) >= start && Date.parse(match[1]) <= Date.now());
});

test('health endpoint reports a healthy service with valid telemetry', async () => {
  const start = Date.now();
  const response = await fetch(base + '/health');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.equal(body.status, 'ok');
  assert.equal(body.service, 'srinipo-app');
  assert.equal(body.version, version);
  assert.ok(Number.isInteger(body.uptimeSeconds) && body.uptimeSeconds >= 0);
  assert.ok(Date.parse(body.timestamp) >= start && Date.parse(body.timestamp) <= Date.now());
});

test('unknown routes return 404', async () => {
  const response = await fetch(base + '/not-a-route');
  assert.equal(response.status, 404);
});
