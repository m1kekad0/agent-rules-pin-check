#!/usr/bin/env node
import { checkRepo, DEFAULT_VENDOR_DIR } from '../src/check.mjs';

const HELP = `Usage: agent-rules-pin-check [--json] [--vendor-dir <path>] [dir ...]

Verify that vendored ai-agent-rules files match the bytes and SHA256 recorded
in <dir>/<vendor-dir>/PROVENANCE.md. Read-only. Default dir: "."
Default vendor dir: ${DEFAULT_VENDOR_DIR}
Exit codes: 0 all ok, 1 mismatch found, 2 usage error.`;

export async function main(argv, out = process.stdout) {
  const dirs = [];
  let json = false;
  let vendorDir;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { out.write(HELP + '\n'); return 0; }
    else if (a === '--json') json = true;
    else if (a === '--vendor-dir') {
      vendorDir = argv[++i];
      if (!vendorDir) { out.write('error: --vendor-dir needs a value\n'); return 2; }
    } else if (a.startsWith('-')) { out.write(`error: unknown option ${a}\n`); return 2; }
    else dirs.push(a);
  }
  if (dirs.length === 0) dirs.push('.');
  const results = [];
  for (const d of dirs) results.push(await checkRepo(d, { vendorDir }));
  if (json) out.write(JSON.stringify(results, null, 2) + '\n');
  else for (const r of results) {
    out.write(`${r.ok ? 'OK  ' : 'FAIL'} ${r.dir}${r.commit ? ` @ ${r.commit.slice(0, 12)}` : ''}\n`);
    for (const p of r.problems) out.write(`     - ${p}\n`);
  }
  return results.every((r) => r.ok) ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('agent-rules-pin-check.mjs')) {
  process.exitCode = await main(process.argv.slice(2));
}
