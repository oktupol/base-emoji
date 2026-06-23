# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@oktupol/base-emoji` is a binary-to-text encoding (like base32/base64) that uses 1024 unique single-code-point emoji as its character set. Each emoji encodes a 10-bit tuple. Published to npm both as a library (`BaseEmoji.encode` / `BaseEmoji.decode`) and as a CLI (`base-emoji`).

## Commands

- `npm run build` — compile TypeScript (`src/` → `dist/`) via `tsc -p .`
- `npm run watch` — incremental rebuild on change
- `npm run debug` — build with sourcemaps
- `npm test` — run the Jest suite
- Run a single test file: `npx jest src/lib/base-emoji.spec.ts`
- Filter by test name: `npx jest -t 'partial name'`

Tests run through Babel (`babel-jest` + `@babel/preset-typescript`), **not** `ts-node`, so they do not type-check. Use `npm run build` to catch type errors. `*.spec.*` files are excluded from the published package via `.npmignore`.

## Architecture

The whole encoder is one class: `BaseEmoji` in `src/lib/base-emoji.ts`. `src/index.ts` re-exports it as the library entry point; `src/cli.ts` is the `commander`-based CLI wrapper (the only runtime dependency).

The core algorithm is `BaseEmoji.transpose(tuples, m, n)` — a private bit-regrouping routine that rewrites a stream of `m`-bit tuples into `n`-bit tuples without inserting or removing any bits. Encoding transposes bytes 8→10 (one emoji per 10-bit value); decoding transposes 10→8 to recover bytes. It returns `{ transposed, remainder, bitsRemaining }`; read the doc comment above the method before touching it, as the `bitsRemaining` naming is deliberately overloaded and explained there.

Because 10 does not divide 8 evenly, the last emoji may carry leftover bits. A **padding emoji** (a clock face 🕛–🕘, index = bits of overhang) is appended so the decoder knows how many trailing bits are real data. See `specialEmojis.padding`.

`src/lib/emojis.ts` defines the character set:
- `emojis` — an array of ~1024+ emoji, truncated to exactly 1024 with `emojis.splice(1024)`. **Index = encoded value; order is the wire format.** Reordering, inserting, or removing any emoji before index 1024 silently breaks compatibility with all previously encoded data.
- `emojiDecodeMap` — reverse map (emoji → index), built from `emojis`.
- `specialEmojis` — padding clocks plus the "armor" markers (🔵 fill, 💝 begin, 💔 end, 🔢 default descriptor). These must stay outside the first 1024 data emoji.

**Armor** (`-a` / `armor` option) wraps the output in PGP-style 🔵 boundary lines with an optional descriptor. `dearmor()` strips it back off with a single unicode regex that reconstructs and matches the begin/end boundaries — when changing armor markers or formatting, update `armor()` and `dearmor()` together.

## Gotchas

- String input is treated as bytes via `charCodeAt` (`toUint8Array`), so only the low 8 bits of each char survive. This is a byte encoder, not a UTF-8 text encoder.
- All character iteration uses spread (`[...str]`) or unicode-flagged regex (`/u`, `/gmu`) because emoji are multi-code-unit; never index emoji strings with `[i]` or `.length` expecting one-per-char.
- `program.version(...)` in `src/cli.ts` and `package.json`'s `version` are maintained by hand and **must match**. The publish workflow's `check-versions` job fails the release unless `package.json` version, the git tag (minus its leading char), and `node dist/cli.js -V` are all equal.
- `src/lib/emojis_unicode.js` is an untracked scratch file, not part of the build.

## CI

`.github/workflows/test.yml` builds and runs Jest on Linux and Windows (Node 17) for every push to any branch and PRs to `main`. `.github/workflows/publish.yml` fires on a published GitHub release: it re-runs tests, enforces the version check above, then publishes to both npmjs.com and GitHub Packages. Commits whose message contains `[skip ci]` (used for README/version bumps) skip the workflows.
