# AGENTS.md

Guidance for autonomous coding agents operating in this repository.
Use this as the execution playbook for build/test/lint tasks and code-change conventions.

## Source of Truth

- Trust executable config first: `package.json`, `turbo.json`, workspace `package.json` scripts.
- Treat prose docs as secondary when conflicts appear.
- Package manager on this branch: `pnpm` (`packageManager: pnpm@10.28.0`).

## Repository Profile

- Monorepo: Turborepo + pnpm workspaces.
- Primary app: `apps/template-app` (Vue 3).
- Shared packages: `packages/ui`, `packages/utils`, and shared config packages.
- Root engines: Node >= 24, npm >= 11, pnpm >= 10.

## Directory Map

- `apps/template-app`: Vue app (Vite + Vitest + Vue Router + Pinia).
- `packages/ui`: UI component library built with Vite.
- `packages/utils`: utility library built with tsdown.
- `packages/eslint-config`: shared ESLint flat configs.
- `packages/typescript-config`: strict shared TS configs.
- `packages/test-config`: shared Vitest config factory.
- `turbo.json`: task graph, dependency edges, cache behavior.

## Install / Bootstrap

```bash
pnpm install
```

## Root Commands (most common)

```bash
pnpm build
pnpm dev
pnpm lint
pnpm format
pnpm format:check
pnpm spell
pnpm type-check
pnpm test
pnpm test:watch
pnpm clean
```

## Workspace-Scoped Commands

Use `--filter` for targeted execution:

```bash
pnpm --filter @repo/template-app dev
pnpm --filter @repo/template-app build
pnpm --filter @repo/ui build
pnpm --filter @repo/ui type-check
pnpm --filter @repo/utils test
```

## Single Test Execution (important)

Each package `test` script uses `vitest run`, so pass file paths directly:

```bash
# utils single test file
pnpm --filter @repo/utils test src/math/__tests__/sum.spec.ts

# template-app single test file
pnpm --filter @repo/template-app test src/components/__tests__/HelloWorld.spec.ts
```

## Turborepo Task Model

- `build`: depends on `^build`, outputs `dist/**`.
- `dev`: depends on `^build`, `persistent: true`, `cache: false`.
- `lint`: depends on `transit`.
- `type-check`: depends on `transit`.
- `test`: depends on `transit`, outputs `coverage/**`.
- `test:watch`: persistent and non-cached.

## Lint / Format / Hooks

- ESLint is primary linter across root + packages.
- `apps/template-app` runs `oxlint` + `eslint` (`run-s lint:*`).
- Formatter is `oxfmt` (not Prettier) via root scripts and lint-staged.
- `oxfmt` uses `--ignore-path .oxfmtignore`.
- Pre-commit hook: `pnpm exec lint-staged --verbose`.
- Commit-msg hook: `pnpm exec commitlint --edit $1`.

## TypeScript Standards

Shared baseline (`packages/typescript-config/src/tsconfig.base.json`) enforces:

- `strict: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`
- `moduleResolution: bundler`
- `verbatimModuleSyntax: true`
- `isolatedModules: true`

Agent guidance:

- Do not suppress type errors with `as any` / `@ts-ignore` unless explicitly requested.
- Prefer explicit interfaces/types for public APIs.
- Keep type surface stable when editing exported modules.

## Vue / Frontend Conventions

- Use Composition API with `<script setup lang="ts">`.
- Use typed props with `defineProps<...>()`.
- Keep SFC structure order: script -> template -> style.
- Vue rule `vue/multi-word-component-names` is enabled at warning level.
- Respect established utility class patterns and UnoCSS usage.

## Imports and Module Conventions

- Prefer clear grouping: external imports first, internal imports second.
- Use `import type` where semantically appropriate.
- Keep barrel exports focused (`packages/*/src/index.ts`).
- Avoid introducing circular deps across workspaces.

## Naming Conventions

- Workspace package names follow `@repo/<name>`.
- Vue component filenames generally PascalCase in app/UI component areas.
- Utility directories/modules are often lower-case (`math`, `time`).
- Test file conventions: `*.spec.ts`, `*.test.ts`, and Vue equivalents.

## Error Handling Expectations

- No empty `catch` blocks.
- Preserve context when rethrowing errors.
- Do not silently swallow async failures.
- Keep bugfixes minimal and scoped; avoid opportunistic refactors.

## Testing Expectations

- Framework: Vitest.
- Shared default environment: `jsdom`.
- Shared default excludes include `e2e/**`.
- For non-trivial changes, run:
  1. related single tests,
  2. impacted package tests,
  3. root `pnpm test` for cross-package changes.

## Line Endings and Editor Defaults

- Git attributes enforce LF: `* text=auto eol=lf`.
- `.editorconfig` defaults: UTF-8, 2-space indent, trim trailing whitespace, final newline.

## Cursor / Copilot Rules Check

Checked locations:

- `.cursor/rules/`
- `.cursorrules`
- `.github/copilot-instructions.md`

Result:

- No Cursor rules or Copilot instruction files are present in this repository.
