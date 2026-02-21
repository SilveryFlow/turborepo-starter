# AGENTS.md

Instructions for coding agents working in this repository.
This document is derived from executable configs (`package.json`, `turbo.json`, eslint/ts/vitest configs).

## Environment Rule: mise-first toolchain (MANDATORY)

- This machine uses `mise` as the single source of truth for runtimes and global CLIs.
- Never use `npm i -g` or `bun add -g` for tool installation.
- Install global CLIs via `mise` only: `mise use -g npm:<package>@<version>`.
- Prefer execution via `mise x ... -- <cmd>` / `mise exec -- <cmd>` when possible.
- Treat `mise` state-changing commands as exclusive/serial:
  - `mise use`, `mise install`, `mise reshim` MUST NOT run in parallel.
- Avoid running `mise reshim` unless explicitly required by the user.
- If a required CLI is missing, first check `mise which <cmd>` and suggest a `mise use -g npm:<pkg>` fix.

## Package Manager: Bun

- Package manager on this branch: Bun (`packageManager: bun@1.3.8`).
- Use `bun` for all package operations (install, add, run, etc.).
- Workspace filter syntax: `bun run --filter <package-name> <command>`.
- For Bun package executors, prefer `bun x <pkg>` (do not assume `bunx` command exists).
- Important caveat: Use `bun run build` and `bun run test` (avoid bare `bun build` / `bun test`).

## Source of truth

- Treat scripts/config files as authoritative.
- If prose docs conflict with scripts/config, follow scripts/config.

## Layout

- `apps/template-app`: Vue app (Vite + Vitest + Vue Router + Pinia).
- `packages/ui`: UI component library built with Vite.
- `packages/utils`: utility library built with tsdown.
- `packages/config-eslint`: shared ESLint flat configs.
- `packages/config-typescript`: strict shared TS configs.
- `packages/config-test`: shared Vitest config factory.
- `turbo.json`: task graph, dependency edges, cache behavior.

## Setup

```bash
bun install
```

Notes:

- Keep `bun.lock` authoritative.
- Do not switch package manager in this branch.

## Root commands

```bash
bun dev
bun run build
bun lint
bun format
bun format:check
bun spell
bun type-check
bun run test
bun test:watch
```

Important Bun caveat:

- Use `bun run build` and `bun run test` (avoid bare `bun build` / `bun test`).

## Package-scoped commands

```bash
bun run --filter @repo/template-app dev
bun run --filter @repo/template-app build
bun run --filter @repo/ui build
bun run --filter @repo/ui type-check
bun run --filter @repo/utils test
```

## Single-test commands (important)

Vitest scripts are wired as `vitest run`, so pass a file path:

```bash
# utils single test file
bun run --filter @repo/utils test src/math/__tests__/sum.spec.ts

# app single test file
bun run --filter @repo/template-app test src/components/__tests__/HelloWorld.spec.ts
```

## Turborepo task behavior

- `build` depends on `^build`.
- `dev` depends on `^build`, is persistent, cache disabled.
- `lint`, `type-check`, `test` depend on `transit`.
- `test` outputs `coverage/**`.
- `test:watch` is persistent and non-cached.

## Lint/format/hooks

- Lint:
  - Root and packages use ESLint.
  - `apps/template-app` runs `oxlint` then `eslint`.
- Format:
  - Formatter is `oxfmt`.
  - Config: `.oxfmtrc.json`.
  - Ignore path is passed explicitly: `--ignore-path .oxfmtignore`.
- Pre-commit:
  - Husky runs `bun x lint-staged --verbose`.
  - lint-staged runs ESLint + oxfmt + cspell on staged files.
- Commit-msg:
  - `bun x commitlint --edit $1`.

## TypeScript standards

Shared baseline (`packages/config-typescript/src/tsconfig.base.json`) enforces:

- `strict: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`
- `moduleResolution: bundler`
- `verbatimModuleSyntax: true`
- `isolatedModules: true`

Agent rules:

- Do not bypass type safety (`any`, suppression comments) unless explicitly requested.
- Prefer narrow, explicit types for public APIs.
- Keep exported types stable and intentional.

## Vue and frontend conventions

- Use Composition API with `<script setup lang="ts">`.
- Define typed props via `defineProps<...>()`.
- Keep SFC order: script -> template -> style.
- Multi-word component names are expected (`vue/multi-word-component-names` warning).
- Follow existing utility/style conventions before introducing new patterns.

## Imports and paths

- Alias `@` maps to `src` in app/ui TS + Vite config.
- Keep imports deterministic:
  - external imports first
  - internal alias/relative imports next
  - type-only imports when applicable
- Keep barrel exports minimal and explicit (`src/index.ts`).

## Naming conventions

- Workspace package names: `@repo/<name>`.
- Vue components: prefer PascalCase where local area uses PascalCase.
- Utility modules: lower-case directories are common (`math`, `time`).
- Test files: `*.spec.ts` / `*.test.ts` (and Vue equivalents).

## Error handling

- No empty `catch` blocks.
- Preserve/attach context when rethrowing errors.
- Do not silently ignore async failures.
- Keep bugfixes focused; avoid unrelated refactors.

## Testing expectations

- Framework: Vitest.
- Shared default environment: `jsdom`.
- Shared default excludes include `e2e/**`.
- For non-trivial changes, run:
  1. related single tests,
  2. impacted package tests,
  3. root `bun run test` for cross-package impact.

## Cursor/Copilot rules check

Checked locations:

- `.cursor/rules/`
- `.cursorrules`
- `.github/copilot-instructions.md`

Result:

- No Cursor or Copilot rule files found in this repository.
