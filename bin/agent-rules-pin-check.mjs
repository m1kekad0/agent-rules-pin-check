#!/usr/bin/env node
import { checkRepo, DEFAULT_VENDOR_DIR } from '../src/check.mjs';

const HELP = `Usage: agent-rules-pin-check [--json] [--vendor-dir <path>] [--upstream [--fail-on-drift]] [dir ...]

Verify that vendored ai-agent-rules files match the bytes and SHA256 recorded
in <dir>/<vendor-dir>/PROVENANCE.md. Read-only. Default dir: "."
Default vendor dir: ${DEFAULT_VENDOR_DIR}
--upstream: compare the pin to GitHub main (optional GITHUB_TOKEN).
--fail-on-drift: require --upstream; fail on relevant drift or unverifiable upstream.
Exit codes: 0 pins match (upstream informational by default), 1 check failed, 2 usage error.`;

export async function main(argv, out = process.stdout, { fetch, token } = {}) {
  const dirs = [];
  let json = false;
  let upstream = false;
  let failOnDrift = false;
  let vendorDir;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { out.write(HELP + '\n'); return 0; }
    else if (a === '--json') json = true;
    else if (a === '--upstream') upstream = true;
    else if (a === '--fail-on-drift') failOnDrift = true;
    else if (a === '--vendor-dir') {
      vendorDir = argv[++i];
      if (!vendorDir) { out.write('error: --vendor-dir needs a value\n'); return 2; }
    } else if (a.startsWith('-')) { out.write(`error: unknown option ${a}\n`); return 2; }
    else dirs.push(a);
  }
  if (failOnDrift && !upstream) {
    out.write('error: --fail-on-drift requires --upstream\n'); return 2;
  }
  if (dirs.length === 0) dirs.push('.');
  const results = [];
  for (const d of dirs) results.push(await checkRepo(d, { vendorDir, upstream, failOnDrift, fetch, token }));
  if (json) out.write(JSON.stringify(results, null, 2) + '\n');
  else for (const r of results) {
    out.write(`${r.ok ? 'OK  ' : 'FAIL'} ${r.dir}${r.commit ? ` @ ${r.commit.slice(0, 12)}` : ''}\n`);
    for (const p of r.problems) out.write(`     - ${p}\n`);
    if (r.upstream?.status === 'unverifiable') {
      out.write(`     upstream: unverifiable (${r.upstream.reason})\n`);
    } else if (r.upstream) {
      out.write(`     upstream: ahead_by=${r.upstream.ahead_by}, AGENTS.md changed=${r.upstream.agentsChanged}, LICENSE changed=${r.upstream.licenseChanged}\n`);
    }
  }
  return results.every((r) => r.ok) ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('agent-rules-pin-check.mjs')) {
  process.exitCode = await main(process.argv.slice(2));
}
