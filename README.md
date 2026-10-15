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

## Use in a consumer repo / 消費側での利用

After checking out the consumer repository and setting up Node.js 22+, add these steps to the same GitHub Actions job. Replace `<FULL_COMMIT_SHA>` with a reviewed full 40-character commit SHA of this tool. No `npm install` is needed.

消費側リポジトリをチェックアウトし、Node.js 22 以降を準備した後、同じ GitHub Actions ジョブに以下を追加します。`<FULL_COMMIT_SHA>` は、このツールのレビュー済みの完全な 40 桁コミット SHA に置き換えてください。`npm install` は不要です。

```yaml
- name: Checkout pin checker
  uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1
  with:
    repository: m1kekad0/agent-rules-pin-check
    ref: <FULL_COMMIT_SHA>
    path: .tools/agent-rules-pin-check
    persist-credentials: false
- name: Check consumer rules pin
  working-directory: ${{ github.workspace }}
  run: node .tools/agent-rules-pin-check/bin/agent-rules-pin-check.mjs .
```

The final `.` selects the consumer root, containing `vendor/ai-agent-rules/PROVENANCE.md`. See the [provenance format](docs/provenance-format.md) for the required fields.

末尾の `.` は、`vendor/ai-agent-rules/PROVENANCE.md` がある消費側のルートを指定します。必須フィールドは [provenance の形式](docs/provenance-format.md) を参照してください。

## Development

Requires Node.js 22+. `npm run lint`, `npm test`.

## License

MIT. The vendored rules in `vendor/ai-agent-rules/` are MIT-licensed by their upstream; see `vendor/ai-agent-rules/LICENSE` and `PROVENANCE.md`.
