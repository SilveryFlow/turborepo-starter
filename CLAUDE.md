# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment Rule: mise-first toolchain (MANDATORY)

- This machine uses `mise` as the single source of truth for runtimes and global CLIs.
- Never use `npm i -g` or `pnpm add -g` for tool installation.
- Install global CLIs via `mise` only: `mise use -g npm:<package>@<version>`.
- Prefer execution via `mise x ... -- <cmd>` / `mise exec -- <cmd>` when possible.
- Treat `mise` state-changing commands as exclusive/serial:
  - `mise use`, `mise install`, `mise reshim` MUST NOT run in parallel.
- Avoid running `mise reshim` unless explicitly required by the user.
- If a required CLI is missing, first check `mise which <cmd>` and suggest a `mise use -g npm:<pkg>` fix.

## Package Manager: pnpm

- Package manager on this branch: `pnpm` (`packageManager: pnpm@10.28.0`).
- Use `pnpm` for all package operations (install, add, run, etc.).
- Workspace filter syntax: `pnpm --filter <package-name> <command>`.

## 项目概述

这是一个基于 pnpm + Turborepo 的 monorepo 项目，用于构建 Vue 3 应用程序和可共享的 UI 组件库。

**分支版本：**

- **main 分支（当前）**：使用 pnpm 作为包管理器，磁盘占用更小
- **bun 分支**：使用 Bun 作为包管理器，安装速度更快

切换分支命令：`git switch bun` 或 `git switch main`

**技术栈：**

- Vue 3 (Composition API + `<script setup>`)
- TypeScript 6
- Vite 8
- Element Plus (UI 组件库)
- UnoCSS (原子化 CSS)
- Pinia (状态管理)
- Vitest 4 (测试框架)
- Oxlint + oxfmt (lint + 格式化)

## 常用命令

### 根级别命令（通过 Turborepo 执行）

```bash
# 构建所有包
pnpm build

# 启动所有开发服务器
pnpm dev

# Lint 所有包（包括根目录）
pnpm lint

# 修复格式化
pnpm format

# 检查格式化
pnpm format:check

# 拼写检查（全项目）
pnpm spell

# 类型检查
pnpm type-check

# 运行所有测试
pnpm test

# 运行测试监视模式
pnpm test:watch

# 清理所有包（dist + node_modules）
pnpm clean

# 仅清理依赖
pnpm clean:deps

# 仅清理构建产物
pnpm clean:artifacts

# 创建新的 workspace（应用或包）
pnpm app:new

# 复制现有 workspace
pnpm app:copy

# 提交代码（使用 Commitizen）
pnpm commit
```

### 针对特定包的命令

使用 `--filter` 标志针对特定包执行命令：

```bash
# 仅构建 ui 包
pnpm --filter @repo/ui build

# 仅在 template-app 中运行 dev
pnpm --filter @repo/template-app dev

# 仅测试 utils 包
pnpm --filter @repo/utils test

# 类型检查特定包
pnpm --filter @repo/ui type-check
```

### 单个测试

```bash
# 在 utils 包中运行特定测试文件
pnpm --filter @repo/utils test src/math/__tests__/sum.spec.ts

# 在 template-app 中运行特定测试
pnpm --filter @repo/template-app test src/components/__tests__/HelloWorld.spec.ts
```

## 项目架构

### 目录结构

```
pnpm-turborepo/
├── apps/
│   ├── template-app/          # Vue 3 应用程序模板
│   └── storybook/             # Storybook 10 组件文档和视觉测试
├── packages/
│   ├── config-eslint/         # 共享 ESLint flat-config 预设
│   ├── config-typescript/     # 共享 TypeScript 配置预设
│   ├── config-test/           # 共享 Vitest 配置工厂
│   ├── config-vite/           # 共享 Vite 配置（通用插件预设 + 构建选项）
│   ├── config-unocss/         # 共享 UnoCSS 配置预设
│   ├── utils/                 # 工具函数库（使用 tsdown 构建）
│   └── ui/                    # Vue 3 UI 组件库（使用 Vite 构建）
├── turbo.json                 # Turborepo 配置
├── pnpm-workspace.yaml        # pnpm workspace 配置
├── commitlint.config.js       # Commitlint 配置
└── lint-staged.config.js      # Lint-staged 配置
```

### Workspace 依赖

包通过 `workspace:*` 协议引用其他内部包。例如：

- `@repo/template-app` 依赖 `@repo/ui` 和 `@repo/utils`
- `@repo/ui` 依赖 `@repo/config-vite` 和各种配置包
- `@repo/storybook` 依赖 `@repo/ui`

### Turborepo 任务管道

关键任务依赖关系：

- **build**: 依赖 `^build`（依赖包必须先构建）
- **dev**: 依赖 `^build`（依赖包必须先构建），禁用缓存，持久化任务
- **lint**: 子包依赖 `transit`（仅 eslint），根目录 `//#lint:oxlint`（全局 oxlint）+ `//#lint:root`（根 eslint）
- **type-check**: 依赖 `transit`
- **test**: 依赖 `transit`
- **test:watch**: 禁用缓存，持久化任务

`transit` 是一个内部任务，用于处理源文件的构建转换，依赖 `^transit`。它不产生输出，仅作为轻量级依赖传播机制，使 lint/type-check 等任务无需等待完整 build。

### 包类型

**配置包**（纯配置导出，无需构建）：

- `@repo/config-eslint` — 导出 base/vue/vitest/vitest-vue 预设
- `@repo/config-typescript` — 导出 JSON tsconfig 预设

**构建配置包**（使用 tsdown 构建）：

- `@repo/config-vite`
- `@repo/config-test`
- `@repo/config-unocss`

**工具库**（使用 tsdown 构建）：

- `@repo/utils`

**UI 组件库**（使用 Vite 库模式构建）：

- `@repo/ui`

**应用程序**（Vue 3 + Vite）：

- `@repo/template-app`
- `@repo/storybook`

## Vue 3 开发规范

**必须使用：**

- Composition API with `<script setup>`
- TypeScript
- `<script setup lang="ts">` 格式
- 组件文件名使用 PascalCase（如 `Button.vue`、`Input.vue`）

组件示例：

```vue
<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
}

const props = defineProps<Props>()
const count = ref(0)
</script>

<template>
  <div>{{ props.title }}: {{ count }}</div>
</template>
```

## Git 工作流

### 提交规范

项目使用 Commitizen + Commitlint 进行提交规范检查。

运行 `pnpm commit` 会启动交互式提交界面，支持：

- 提交类型：feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- 作用域：自动读取 apps/ 和 packages/ 目录下的包名
- Emoji 支持
- 中文提示信息

提交示例：

```
feat(ui): :sparkles: 添加新的 Button 组件
fix(template-app): :bug: 修复路由跳转问题
chore(root): :hammer: 更新依赖版本
```

### Lint 架构

- **oxlint**: Root Task，根目录全局执行（`//#lint:oxlint`），极快扫描全仓库
- **ESLint**: 逐包执行，各包通过 `@repo/config-eslint` 选择 preset，`eslint-plugin-oxlint` 禁用 oxlint 已覆盖的规则
- **lint-staged**: pre-commit 时对暂存文件运行 oxlint → eslint → oxfmt → cspell

## 环境要求

- Node.js >= 24
- npm >= 11
- pnpm >= 10
- 包管理器：pnpm@10.28.0

## 关键配置文件

- `turbo.json`: Turborepo 任务定义和依赖关系
- `pnpm-workspace.yaml`: pnpm workspace 定义
- `commitlint.config.js`: 提交信息规范配置
- `lint-staged.config.js`: Git 暂存文件检查配置
- `cspell.config.js`: 拼写检查配置
- `eslint.config.js`: 根目录 ESLint 配置
- `.oxlintrc.json`: 根目录 Oxlint 配置

## 创建新包或应用

### 使用 Turborepo generator

```bash
# 创建新的应用或包
pnpm app:new

# 复制现有的应用或包
pnpm app:copy
```

### 手动创建

1. 在 `apps/` 或 `packages/` 中创建新目录
2. 添加 `package.json`，设置 `name: "@repo/your-package"`
3. 在 `package.json` 中添加必要的脚本（build, dev, lint 等）
4. 在 turbo.json 中的任务会自动应用到新包
5. 如果包需要被其他包使用，确保正确设置 `exports` 字段

## 构建

配置包和工具库使用 **tsdown** 构建：

```bash
pnpm --filter @repo/config-vite build
pnpm --filter @repo/utils build
```

UI 组件库和应用程序使用 **Vite** 构建：

```bash
pnpm --filter @repo/ui build
pnpm --filter @repo/template-app build
```
