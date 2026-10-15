import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { checkRepo } from '../src/check.mjs';
import { parseProvenance } from '../src/provenance.mjs';
import { main } from '../bin/agent-rules-pin-check.mjs';

const sha = (s) => createHash('sha256').update(s).digest('hex');
const COMMIT = 'a'.repeat(40);

async function fixture({ agents = 'synthetic rules\n', license = 'synthetic license\n', recordAgents, recordLicense, japanese = false } = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'pin-'));
  const v = join(dir, 'vendor/ai-agent-rules');
  await mkdir(v, { recursive: true });
  const ra = recordAgents ?? agents;
  const rl = recordLicense ?? license;
  await writeFile(join(v, 'AGENTS.md'), agents);
  await writeFile(join(v, 'LICENSE'), license);
  const lines = [
    japanese ? '- Upstream: `https://example.invalid/rules`' : '- Upstream URL: https://example.invalid/rules',
    `- Commit: \`${COMMIT}\``,
    '- Path: `AGENTS.md`',
    `- Bytes: \`${Buffer.byteLength(ra)}\``,
    `- SHA256: \`${sha(ra)}\``,
    `- License bytes: \`${Buffer.byteLength(rl)}\``,
    `- License SHA256: \`${sha(rl)}\``,
  ];
  await writeFile(join(v, 'PROVENANCE.md'), lines.map((line, i) => japanese
    ? line + (i % 2 === 0 ? '（ai-agent-rules v0）' : '日本語の注記')
    : line).join('\n') + '\n');
  return dir;
}

test('parses all fields', () => {
  const { fields, missing } = parseProvenance(`- Commit: \`${COMMIT}\`\n- Bytes: \`3\``);
  assert.equal(fields.commit, COMMIT);
  assert.equal(fields.bytes, 3);
  assert.ok(missing.includes('sha256'));
});

test('accepts both upstream labels with plain or backticked URLs and annotations', () => {
  const upstream = 'https://example.invalid/rules';
  const values = [
    upstream,
    `${upstream} 日本語の注記`,
    `\`${upstream}\``,
    `\`${upstream}\`（ai-agent-rules v0）`,
    `\`${upstream}\`日本語の注記`,
  ];
  for (const label of ['Upstream URL', 'Upstream']) {
    for (const value of values) {
      const line = `- ${label}: ${value}`;
      const { fields, missing } = parseProvenance(line);
      assert.equal(fields.upstream, upstream, line);
      assert.ok(!missing.includes('upstream'), line);
    }
  }
});

test('an empty upstream field cannot consume the next line', () => {
  for (const label of ['Upstream URL', 'Upstream']) {
    const { fields, missing } = parseProvenance(`- ${label}:\n- Path: \`AGENTS.md\``);
    assert.equal(fields.upstream, undefined);
    assert.ok(missing.includes('upstream'));
    assert.equal(fields.path, 'AGENTS.md');
  }
});

test('Japanese-style provenance preserves exact fields and verifies a synthetic pin', async () => {
  const agents = '# 合成のルール\n';
  const license = '合成のライセンス\n';
  const dir = await fixture({ agents, license, japanese: true });
  const provenance = await readFile(join(dir, 'vendor/ai-agent-rules/PROVENANCE.md'), 'utf8');
  const { fields, missing } = parseProvenance(provenance);
  assert.deepEqual(missing, []);
  assert.deepEqual(fields, {
    upstream: 'https://example.invalid/rules',
    commit: COMMIT,
    path: 'AGENTS.md',
    bytes: Buffer.byteLength(agents),
    sha256: sha(agents),
    licenseBytes: Buffer.byteLength(license),
    licenseSha256: sha(license),
  });
  const r = await checkRepo(dir);
  assert.deepEqual(r.problems, []);
  assert.equal(r.ok, true);
  assert.equal(r.commit, COMMIT);
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
