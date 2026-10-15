import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { checkRepo } from '../src/check.mjs';
import { parseProvenance } from '../src/provenance.mjs';
import { main } from '../bin/agent-rules-pin-check.mjs';

const sha = (s) => createHash('sha256').update(s).digest('hex');
const COMMIT = 'a'.repeat(40);

async function fixture({ agents = 'synthetic rules\n', license = 'synthetic license\n', recordAgents, recordLicense } = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'pin-'));
  const v = join(dir, 'vendor/ai-agent-rules');
  await mkdir(v, { recursive: true });
  const ra = recordAgents ?? agents;
  const rl = recordLicense ?? license;
  await writeFile(join(v, 'AGENTS.md'), agents);
  await writeFile(join(v, 'LICENSE'), license);
  await writeFile(join(v, 'PROVENANCE.md'), [
    '- Upstream URL: https://example.invalid/rules',
    `- Commit: \`${COMMIT}\``,
    '- Path: `AGENTS.md`',
    `- Bytes: \`${Buffer.byteLength(ra)}\``,
    `- SHA256: \`${sha(ra)}\``,
    `- License bytes: \`${Buffer.byteLength(rl)}\``,
    `- License SHA256: \`${sha(rl)}\``,
    '',
  ].join('\n'));
  return dir;
}

test('parses all fields', () => {
  const { fields, missing } = parseProvenance(`- Commit: \`${COMMIT}\`\n- Bytes: \`3\``);
  assert.equal(fields.commit, COMMIT);
  assert.equal(fields.bytes, 3);
  assert.ok(missing.includes('sha256'));
});

test('matching pin is ok', async () => {
  const r = await checkRepo(await fixture());
  assert.deepEqual(r.problems, []);
  assert.equal(r.ok, true);
  assert.equal(r.commit, COMMIT);
});

test('modified AGENTS.md is reported', async () => {
  const r = await checkRepo(await fixture({ agents: 'edited\n', recordAgents: 'original\n' }));
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.startsWith('AGENTS.md: sha256')));
});

test('modified LICENSE is reported', async () => {
  const r = await checkRepo(await fixture({ license: 'x\n', recordLicense: 'y\n' }));
  assert.ok(r.problems.some((p) => p.startsWith('LICENSE: sha256')));
});

test('missing provenance is reported', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'pin-'));
  const r = await checkRepo(dir);
  assert.equal(r.ok, false);
});

test('cli exit codes', async () => {
  const sink = { buf: '', write(s) { this.buf += s; } };
  assert.equal(await main([await fixture()], sink), 0);
  assert.equal(await main([await fixture({ agents: 'a\n', recordAgents: 'b\n' })], sink), 1);
  assert.equal(await main(['--bogus'], sink), 2);
  const j = { buf: '', write(s) { this.buf += s; } };
  await main(['--json', await fixture()], j);
  assert.equal(JSON.parse(j.buf)[0].ok, true);
});

test('this repository pin is consistent', async () => {
  const r = await checkRepo('.');
  assert.deepEqual(r.problems, []);
});
