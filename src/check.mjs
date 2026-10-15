import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { parseProvenance } from './provenance.mjs';

export const DEFAULT_VENDOR_DIR = 'vendor/ai-agent-rules';

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function measure(file) {
  const buf = await readFile(file);
  return { bytes: buf.length, sha256: createHash('sha256').update(buf).digest('hex') };
}

/**
 * Check one repository directory. Read-only.
 * Returns { dir, ok, commit, problems: string[] }.
 */
export async function checkRepo(dir, { vendorDir = DEFAULT_VENDOR_DIR } = {}) {
  const base = join(dir, vendorDir);
  const problems = [];
  const provPath = join(base, 'PROVENANCE.md');
  if (!(await exists(provPath))) {
    return { dir, ok: false, commit: null, problems: [`missing ${vendorDir}/PROVENANCE.md`] };
  }
  const { fields, missing } = parseProvenance(await readFile(provPath, 'utf8'));
  for (const k of missing) problems.push(`PROVENANCE.md: field "${k}" missing or malformed`);

  const targets = [
    ['AGENTS.md', fields.bytes, fields.sha256],
    ['LICENSE', fields.licenseBytes, fields.licenseSha256],
  ];
  for (const [name, wantBytes, wantSha] of targets) {
    const file = join(base, name);
    if (!(await exists(file))) { problems.push(`missing ${vendorDir}/${name}`); continue; }
    const got = await measure(file);
    if (wantBytes !== undefined && got.bytes !== wantBytes) {
      problems.push(`${name}: bytes ${got.bytes} != recorded ${wantBytes}`);
    }
    if (wantSha !== undefined && got.sha256 !== wantSha) {
      problems.push(`${name}: sha256 ${got.sha256} != recorded ${wantSha}`);
    }
  }
  return { dir, ok: problems.length === 0, commit: fields.commit ?? null, problems };
}
