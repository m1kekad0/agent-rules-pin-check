const unverifiable = (reason) => ({ status: 'unverifiable', reason });

// Restrict credentials and requests to GitHub's API, regardless of provenance input.
function githubRepo(upstream) {
  try {
    const url = new URL(upstream);
    if (url.protocol !== 'https:' || url.host !== 'github.com' ||
        url.username || url.password || url.search || url.hash) return null;
    const match = url.pathname.match(/^\/([a-z0-9-]+)\/([a-z0-9_.-]+)\/?$/i);
    if (!match) return null;
    const repo = match[2].replace(/\.git$/, '');
    if (!repo || repo === '.' || repo === '..') return null;
    return `${match[1]}/${repo}`;
  } catch { return null; }
}

/** Compare a pin to upstream main using only a read-only GitHub REST request. */
export async function checkUpstream({ upstream, commit }, {
  fetch = globalThis.fetch, token = process.env.GITHUB_TOKEN,
} = {}) {
  const repo = githubRepo(upstream);
  if (!repo || !/^[0-9a-f]{40}$/.test(commit ?? '')) return unverifiable('invalid metadata');
  const headers = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(`https://api.github.com/repos/${repo}/compare/${commit}...main`, {
      method: 'GET', headers, redirect: 'error', signal: AbortSignal.timeout(10000),
    });
  } catch { return unverifiable('network'); }
  if (!response.ok) {
    return unverifiable(Number.isInteger(response.status) ? String(response.status) : 'request failed');
  }
  try {
    const data = await response.json();
    if (!Number.isSafeInteger(data.ahead_by) || data.ahead_by < 0 || !Array.isArray(data.files) ||
        !data.files.every((f) => f && typeof f.filename === 'string' &&
          (f.previous_filename === undefined || typeof f.previous_filename === 'string'))) {
      return unverifiable('invalid response');
    }
    // Three-dot comparisons use the merge base, so only forward history is conclusive.
    if ((data.status !== 'identical' && data.status !== 'ahead') || data.behind_by > 0) {
      return unverifiable('diverged');
    }
    // GitHub caps this list at 300; absence of a file at the cap is inconclusive.
    if (data.files.length >= 300) return unverifiable('file list limit');
    const changed = (name) => data.files.some((f) => f.filename === name || f.previous_filename === name);
    const agentsChanged = changed('AGENTS.md');
    const licenseChanged = changed('LICENSE');
    return {
      status: 'verified', ahead_by: data.ahead_by, agentsChanged, licenseChanged,
      drift: data.ahead_by > 0 && (agentsChanged || licenseChanged),
    };
  } catch { return unverifiable('invalid response'); }
}
