// Parse the metadata bullet list of a vendored ai-agent-rules PROVENANCE.md.
const FIELDS = {
  upstream: /^- Upstream URL:\s*(\S+)/m,
  commit: /^- Commit:\s*`([0-9a-f]{40})`/m,
  path: /^- Path:\s*`([^`]+)`/m,
  bytes: /^- Bytes:\s*`(\d+)`/m,
  sha256: /^- SHA256:\s*`([0-9a-f]{64})`/m,
  licenseBytes: /^- License bytes:\s*`(\d+)`/m,
  licenseSha256: /^- License SHA256:\s*`([0-9a-f]{64})`/m,
};

export function parseProvenance(text) {
  const out = {};
  const missing = [];
  for (const [key, re] of Object.entries(FIELDS)) {
    const m = text.match(re);
    if (!m) { missing.push(key); continue; }
    out[key] = key.endsWith('ytes') ? Number(m[1]) : m[1];
  }
  return { fields: out, missing };
}
