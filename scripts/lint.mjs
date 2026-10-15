// Minimal dependency-free lint: syntax check + whitespace hygiene.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const roots = ['src', 'bin', 'scripts', 'test'];
const files = [];
async function walk(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) { if (e.name !== 'fixtures') await walk(p); }
    else if (p.endsWith('.mjs')) files.push(p);
  }
}
for (const r of roots) await walk(r);
let bad = 0;
for (const f of files) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); }
  catch (e) { bad++; console.error(`${f}: syntax error\n${e.stderr}`); }
  const lines = (await readFile(f, 'utf8')).split('\n');
  lines.forEach((l, i) => {
    if (/\s+$/.test(l)) { bad++; console.error(`${f}:${i + 1}: trailing whitespace`); }
    if (/\t/.test(l)) { bad++; console.error(`${f}:${i + 1}: tab character`); }
  });
}
if (bad) { console.error(`${bad} problem(s)`); process.exit(1); }
console.log(`lint ok (${files.length} files)`);
