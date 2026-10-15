# Pinned shared rules

- Upstream URL: https://github.com/m1kekad0/ai-agent-rules
- Commit: `2c9adf1966ee71221fdd5fa19886314822558d87`
- Path: `AGENTS.md`
- Canonical retrieval: https://raw.githubusercontent.com/m1kekad0/ai-agent-rules/2c9adf1966ee71221fdd5fa19886314822558d87/AGENTS.md
- Retrieval date: 2026-10-15 UTC
- Bytes: `5914`
- SHA256: `65305a1834ce55d602e900384980f65beb180ac9ce2df515486a5b06882ae8ea`
- License: MIT (Copyright (c) 2026 m1kekad0), confirmed 2026-10-15
- License file: `LICENSE` from the same commit, vendored unmodified as
  `vendor/ai-agent-rules/LICENSE`
- License bytes: `1065`
- License SHA256: `e0aea83bf0d07947ffd8caa4270006d6f432a2a05fc83e75770fc070a9d705b3`

`AGENTS.md` and `LICENSE` are unmodified copies from the commit above, the
upstream `main` HEAD at retrieval time. The upstream repository was private at
retrieval, so they were retrieved with the GitHub contents API (raw media type)
using `ref=<full commit SHA>`. Byte counts and SHA256 values were measured with
`wc -c` and `sha256sum`, and can be re-checked with `npm run check:pin`. Keep
the `LICENSE` notice with any copy or redistribution of the vendored rules.

## Updating the pin

1. Select an explicit upstream commit and check its license and required
   notices.
2. Retrieve `AGENTS.md` and `LICENSE` at that full commit SHA
   (`raw.githubusercontent.com` URL, or the GitHub contents API with
   `ref=<full commit SHA>` while upstream is private). Preserve the bytes.
3. Update all metadata above, including the UTC retrieval date, then run
   `npm run check:pin`.
4. Run the project checks and obtain independent review of the fixed candidate
   commit.

Never present content retrieved from mutable `main` as this fixed version.
