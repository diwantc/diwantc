// Rules for src/data/reporting-channels/*.yaml that the Astro schema cannot
// see (file name, unique ids and order), plus the 3-month re-verify check.
// The build also validates every file against the schema in src/content.config.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readReportingChannels } from '../scripts/lib/read-data.mjs';

const LANGS = ['ar', 'en', 'fr'];
const TYPES = ['sms', 'phone', 'website', 'app', 'email'];
const files = await readReportingChannels('src/data/reporting-channels');

const localized = (value) => value && typeof value === 'object' && LANGS.every((l) => typeof value[l] === 'string' && value[l].trim());

test('there is at least one country file, and every file parses', () => {
  assert.ok(files.length > 0);
  for (const { rel, parseError } of files) assert.equal(parseError, null, rel);
});

test('each file is named after its country, and order is unique', () => {
  const orders = new Set();
  for (const { rel, data } of files) {
    assert.equal(rel, `${data.country}.yaml`, `${rel}: country is "${data.country}"`);
    assert.ok(localized(data.name), `${rel}: name needs ar, en and fr`);
    assert.ok(!orders.has(data.order), `${rel}: order ${data.order} is used twice`);
    orders.add(data.order);
  }
});

test('every channel is complete and has an official https source', () => {
  const today = new Date();
  for (const { rel, data } of files) {
    const ids = new Set();
    assert.ok(Array.isArray(data.channels) && data.channels.length > 0, `${rel}: no channels`);
    for (const c of data.channels) {
      const where = `${rel} › ${c.id}`;
      assert.match(c.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, where);
      assert.ok(!ids.has(c.id), `${where}: duplicate id`);
      ids.add(c.id);
      assert.ok(TYPES.includes(c.type), `${where}: unknown type ${c.type}`);
      assert.ok(localized(c.name) && localized(c.use), `${where}: name and use need ar, en and fr`);
      if (typeof c.contact === 'string') {
        if (c.type === 'website') assert.match(c.contact, /^https:\/\//, where);
        if (c.type === 'sms' || c.type === 'phone') assert.match(c.contact, /^\+?[0-9 ]{3,20}$/, where);
        if (c.type === 'email') assert.match(c.contact, /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i, where);
      } else {
        assert.equal(c.type, 'app', `${where}: only an app name may be translated`);
        assert.ok(localized(c.contact), `${where}: translated contact needs ar, en and fr`);
      }
      assert.match(c.source?.url ?? '', /^https:\/\//, `${where}: source.url must be https`);
      assert.ok(localized(c.source?.publisher), `${where}: source.publisher needs ar, en and fr`);
      const checked = new Date(c.lastVerified);
      assert.ok(!Number.isNaN(checked.getTime()) && checked <= today, `${where}: lastVerified must be a past date`);
    }
  }
});

test('reverify lists channels older than 3 months', () => {
  const result = spawnSync(process.execPath, ['scripts/reverify.mjs', '--json'], {
    encoding: 'utf8',
    env: { ...process.env, CHANNELS_DIR: 'tests/fixtures/reporting-channels-due', GITHUB_STEP_SUMMARY: '' },
  });
  assert.equal(result.status, 0, result.stderr);
  const due = JSON.parse(result.stdout);
  assert.ok(due.some((d) => d.lessonId === 'reporting channel xx/old-hotline' && d.limitMonths === 3), result.stdout);
});
