> **移行済み / Moved**: このリポジトリは archive されています。pin 検査は [m1kekad0/ai-agent-rules](https://github.com/m1kekad0/ai-agent-rules) の `scripts/check-pin.mjs` に統合されました（ai-agent-rules PR #16）。

# agent-rules-pin-check

vendored された [ai-agent-rules](https://github.com/m1kekad0/ai-agent-rules) の固定コピーが、`PROVENANCE.md` に記録したバイト数・SHA256 と一致しているかを確かめる、依存ゼロの小さな Node.js CLI です。AI エージェント駆動の開発で、共通ルールの pin が壊れていないかを PR ごとに機械的に確認する用途を想定しています。

A tiny, zero-dependency Node.js CLI that verifies a vendored copy of `ai-agent-rules` (`vendor/ai-agent-rules/AGENTS.md` and `LICENSE`) still matches the bytes and SHA256 recorded in its `PROVENANCE.md`. It is read-only and never contacts the network.

## Usage / 使い方

```sh
node bin/agent-rules-pin-check.mjs [--json] [--vendor-dir <path>] [dir ...]
```

- Exit code `0`: all pins match / すべて一致
- Exit code `1`: mismatch or missing file / 不一致・欠落あり
- Exit code `2`: usage error / 引数エラー

This repository checks its own pin in CI with `npm run check:pin`.

## Development

Requires Node.js 22+. `npm run lint`, `npm test`.

## License

MIT. The vendored rules in `vendor/ai-agent-rules/` are MIT-licensed by their upstream; see `vendor/ai-agent-rules/LICENSE` and `PROVENANCE.md`.
