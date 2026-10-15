# PROVENANCE.md format / 形式

The current parser in `src/provenance.mjs` requires all seven bullets below in `vendor/ai-agent-rules/PROVENANCE.md`. Use the exact field names, with `- ` at the start of each line. Other metadata is ignored.

現在の `src/provenance.mjs` は、`vendor/ai-agent-rules/PROVENANCE.md` に以下の 7 項目すべてを要求します。フィールド名は表記どおりに、各行の先頭は `- ` としてください。他のメタデータは無視されます。

| Field / フィールド | Value / 値 |
| --- | --- |
| `Upstream URL` | Unquoted URL with no whitespace / 空白を含まない URL（バッククォートなし） |
| `Commit` | Full 40-character lowercase hexadecimal SHA in backticks / 完全な 40 桁の小文字 16 進 SHA（バッククォートで囲む） |
| `Path` | Nonempty upstream path in backticks, normally `AGENTS.md` / 空でない上流パス（バッククォートで囲む）、通常は `AGENTS.md` |
| `Bytes` | `AGENTS.md` byte count as decimal digits in backticks / `AGENTS.md` のバイト数（10 進数字をバッククォートで囲む） |
| `SHA256` | `AGENTS.md` hash: 64 lowercase hexadecimal characters in backticks / `AGENTS.md` のハッシュ（小文字 16 進数 64 桁をバッククォートで囲む） |
| `License bytes` | `LICENSE` byte count as decimal digits in backticks / `LICENSE` のバイト数（10 進数字をバッククォートで囲む） |
| `License SHA256` | `LICENSE` hash: 64 lowercase hexadecimal characters in backticks / `LICENSE` のハッシュ（小文字 16 進数 64 桁をバッククォートで囲む） |

`Upstream URL`, `Commit`, and `Path` are recorded metadata; the tool does not fetch upstream or verify the commit. It always checks the local `AGENTS.md` and `LICENSE` in the vendor directory, regardless of `Path`.

`Upstream URL`、`Commit`、`Path` は記録用メタデータです。ツールは上流へのアクセスやコミットの検証を行いません。`Path` にかかわらず、vendor ディレクトリ内の `AGENTS.md` と `LICENSE` を検査します。

## Synthetic example / 合成データの例

The URL and commit below are synthetic. The byte counts and hashes match UTF-8 files containing exactly `synthetic rules\n` (`AGENTS.md`) and `synthetic license\n` (`LICENSE`), where `\n` means one LF newline.

以下の URL とコミットは架空です。バイト数とハッシュは、UTF-8 ファイルの内容がそれぞれ `synthetic rules\n`（`AGENTS.md`）、`synthetic license\n`（`LICENSE`）の場合に一致します。`\n` は 1 つの LF 改行を表します。

```markdown
- Upstream URL: https://example.invalid/rules
- Commit: `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`
- Path: `AGENTS.md`
- Bytes: `16`
- SHA256: `712298f434df47685d8353f389b80e1185dfdbd0019dcca3fb611bc219deaa32`
- License bytes: `18`
- License SHA256: `e11bf146591cb8069ac4a4f0ff28fe09de0b5139a2870224d85838f6f2d4af4f`
```
