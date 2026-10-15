# agent-rules-pin-check

vendored された [ai-agent-rules](https://github.com/m1kekad0/ai-agent-rules) の固定コピーが、`PROVENANCE.md` に記録したバイト数・SHA256 と一致しているかを確かめる、依存ゼロの小さな Node.js CLI です。AI エージェント駆動の開発で、共通ルールの pin が壊れていないかを PR ごとに機械的に確認する用途を想定しています。

A tiny, zero-dependency Node.js CLI that verifies a vendored copy of `ai-agent-rules` (`vendor/ai-agent-rules/AGENTS.md` and `LICENSE`) still matches the bytes and SHA256 recorded in its `PROVENANCE.md`. It is read-only and fully offline by default.

## Usage / 使い方

```sh
node bin/agent-rules-pin-check.mjs [--json] [--vendor-dir <path>] [--upstream [--fail-on-drift]] [dir ...]
```

- Exit code `0`: all pins match / すべて一致
- Exit code `1`: mismatch or missing file; with `--fail-on-drift`, relevant upstream drift or unverifiable upstream / 不一致・欠落あり。`--fail-on-drift` 指定時は対象ファイルの upstream 差分・検証不能も失敗
- Exit code `2`: usage error / 引数エラー

This repository checks its own pin in CI with `npm run check:pin`.

`--upstream` は GitHub の pin と `main` を読み取り専用 GET で比較し、`ahead_by` と `AGENTS.md` / `LICENSE` の変更有無を表示します。`GITHUB_TOKEN` は任意で、認証ヘッダーにのみ使用し出力しません。結果は `--json` にも含まれます。通常は情報表示のみですが、`--upstream --fail-on-drift` では main が先行し対象ファイルに変更がある場合、または `upstream: unverifiable (<status>)`（404・401・ネットワーク障害など）の場合に終了コード `1` になります。フラグなしでは完全にオフラインです。

`--upstream` uses a read-only GitHub GET to compare the pin with `main`, reporting `ahead_by` and whether `AGENTS.md` / `LICENSE` changed, including in `--json`. Optional `GITHUB_TOKEN` is sent only in the authorization header and never printed. Results are informational unless `--upstream --fail-on-drift` is set: exit `1` when main is ahead and either file changed, or when upstream is `unverifiable` (404, 401, network failure, etc.). `--fail-on-drift` requires `--upstream`; without these flags, the CLI stays fully offline.

GitHub の比較 API のファイル一覧は最大 300 件のため、300 件に達した比較は検証不能とします。The [GitHub compare API](https://docs.github.com/en/rest/commits/commits#compare-two-commits) lists at most 300 changed files; comparisons reaching this limit are conservatively reported as unverifiable.

## Development

Requires Node.js 22+. `npm run lint`, `npm test`.

## License

MIT. The vendored rules in `vendor/ai-agent-rules/` are MIT-licensed by their upstream; see `vendor/ai-agent-rules/LICENSE` and `PROVENANCE.md`.
