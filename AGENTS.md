# Working on agent-rules-pin-check

- Read and apply the pinned shared rules in [vendor/ai-agent-rules/AGENTS.md](vendor/ai-agent-rules/AGENTS.md) alongside this file. Precedence is: platform constraints > user instructions > this file > pinned shared rules. The shared rules do not weaken this project's gates. See [provenance and update instructions](vendor/ai-agent-rules/PROVENANCE.md).

- This is a small, public, zero-dependency Node.js CLI. Keep it dependency-free unless a Human approves a dependency. Keep each change within the requested scope.
- Use a separate work branch. Preserve unrelated work and keep changes small enough to review.
- Before publishing, inspect all outgoing commits and tracked files (author, committer, trailers, docs, PR text, logs, fixtures). Use only approved public identities. Exclude secrets, tokens, personal email, identifying local paths, and private material. Test fixtures must be synthetic.
- The tool must never write to the repositories it checks, never print tokens, and must only read upstream through read-only requests.
- Run `npm run lint` and `npm test` (and `npm run check:pin`). Report what was actually checked and what is still missing. Obtain an independent review of a fixed commit; after changes, verify and review the updated commit.
- Push normally and open a Draft PR with evidence and limitations. Do not push directly to main, force push, merge, or change repository/account settings.
- An AI agent may mark a PR "Ready for review" only when all of these hold for the current HEAD: (1) an independent AI review is complete with no open findings, (2) CI has passed, and (3) only final Human confirmation remains. If no applicable CI exists for the change, only condition (2) is waived. Otherwise keep it Draft. If a PR needs further changes after it has been marked Ready, first move it back to Draft with `gh pr ready <n> --undo`, then change, re-review, and get CI passing again. Merge remains Human-only.
