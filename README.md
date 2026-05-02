# pnpm + Turborepo Monorepo

> [!NOTE]
> 本仓库提供两个版本：
>
> - **main 分支（当前）**：使用 pnpm 作为包管理器，磁盘占用更小
> - **bun 分支**：使用 Bun 作为包管理器，安装速度更快
>
> 切换分支命令：`git switch bun` 或 `git switch main`

基于 pnpm + Turborepo 构建的 Vue 3 Monorepo 项目模板，用于开发可共享的 UI 组件库和应用程序。

## 特性

- **pnpm** - 快速、节省磁盘空间的包管理器
- **Turborepo** - 高性能的 Monorepo 构建系统
- **Vue 3** - 使用 Composition API + `<script setup>` + TypeScript
- **Vite 8** - 极速的前端构建工具
- **Element Plus** - Vue 3 UI 组件库
- **UnoCSS** - 原子化 CSS 引擎
- **Pinia** - Vue 状态管理库
- **Vitest 4** - 基于 Vite 的测试框架
- **Oxlint + oxfmt** - 极速的 Lint + 格式化工具
- **Storybook 10** - 组件文档和视觉测试

## 项目结构

```
pnpm-turborepo/
├── apps/
│   ├── template-app/          # Vue 3 应用程序模板
│   └── storybook/             # Storybook 10 组件文档
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
└── package.json               # 根 package.json
```

## 快速开始

### 环境要求

- Node.js >= 24
- pnpm >= 10

### 安装依赖

```bash
pnpm install
```

### 开发

启动所有开发服务器：

```bash
pnpm dev
```

启动特定包的开发服务器：

```bash
# 仅启动 template-app
pnpm --filter @repo/template-app dev

# 仅启动 ui 包的开发模式
pnpm --filter @repo/ui dev
```

### 构建

构建所有包：

```bash
pnpm build
```

构建特定包：

```bash
# 仅构建 ui 包
pnpm --filter @repo/ui build

# 构建特定包及其依赖
pnpm --filter @repo/template-app... build
```

## 可用命令

### 根级别命令

| 命令                | 说明                           |
| ------------------- | ------------------------------ |
| `pnpm build`        | 构建所有包                     |
| `pnpm dev`          | 启动所有开发服务器             |
| `pnpm lint`         | Lint 所有包                    |
| `pnpm format`       | 格式化所有代码（oxfmt）        |
| `pnpm format:check` | 检查格式化                     |
| `pnpm spell`        | 拼写检查                       |
| `pnpm type-check`   | 类型检查                       |
| `pnpm test`         | 运行所有测试                   |
| `pnpm test:watch`   | 运行测试监视模式               |
| `pnpm app:new`      | 创建新的 workspace（应用或包） |
| `pnpm app:copy`     | 复制现有 workspace             |
| `pnpm commit`       | 提交代码（使用 Commitizen）    |

### 针对特定包的命令

使用 `--filter` 标志针对特定包执行命令：

```bash
# 仅在 ui 包中运行测试
pnpm --filter @repo/ui test

# 仅类型检查 template-app
pnpm --filter @repo/template-app type-check

# 仅 lint utils 包
pnpm --filter @repo/utils lint
```

### 运行单个测试文件

```bash
# 在 utils 包中运行特定测试文件
pnpm --filter @repo/utils test src/math/__tests__/sum.spec.ts

# 在 template-app 中运行特定测试
pnpm --filter @repo/template-app test src/components/__tests__/HelloWorld.spec.ts
```

## 技术栈

### 前端框架

- **Vue 3** - 渐进式 JavaScript 框架
  - Composition API + `<script setup>`
  - TypeScript 6
- **Vite 8** - 下一代前端构建工具
- **Element Plus** - Vue 3 UI 组件库
- **UnoCSS** - 即时原子化 CSS 引擎
- **Pinia** - Vue 状态管理库

### 开发工具

- **TypeScript 6** - JavaScript 的超集
- **ESLint 9** - 代码 lint 工具（flat config）
- **Oxlint** - 基于 Oxide 的极速 Lint 工具
- **oxfmt** - 基于 Oxide 的代码格式化工具
- **CSpell** - 代码拼写检查工具
- **Vitest 4** - 单元测试框架
- **Commitizen** - 规范化 Git 提交信息
- **Commitlint** - Git 提交信息检查
- **Husky** - Git hooks 管理
- **lint-staged** - Git 暂存文件检查

### 构建工具

- **Turborepo** - 高性能 Monorepo 构建系统
  - 智能缓存和并行执行
  - 增量构建
  - 远程缓存支持
- **pnpm** - 快速、节省磁盘空间的包管理器
  - 原生 workspace 支持
  - 严格的依赖管理
  - 节省磁盘空间

## 包类型

### 配置包（纯配置导出，无需构建）

- `@repo/config-eslint` - 导出 base/vue/vitest/vitest-vue 预设
- `@repo/config-typescript` - 导出 JSON tsconfig 预设

### 构建配置包（使用 tsdown 构建）

- `@repo/config-vite` - Vite 配置
- `@repo/config-test` - Vitest 配置
- `@repo/config-unocss` - UnoCSS 配置

### 工具库

- `@repo/utils` - 工具函数库（使用 tsdown 构建）

### UI 组件库

- `@repo/ui` - Vue 3 UI 组件库（使用 Vite 构建）

### 应用程序

- `@repo/template-app` - Vue 3 应用程序模板（使用 Vite 构建）
- `@repo/storybook` - Storybook 10 组件文档和视觉测试

## Turborepo 任务管道

关键任务依赖关系：

- **build**: 依赖 `^build`（依赖包必须先构建）
- **dev**: 依赖 `^build`，禁用缓存，持久化任务
- **lint**: 子包依赖 `transit`（仅 eslint），根目录全局 oxlint + eslint
- **type-check**: 依赖 `transit`
- **test**: 依赖 `transit`
- **test:watch**: 禁用缓存，持久化任务

`transit` 是一个内部任务，用于处理源文件的构建转换，依赖 `^transit`。它不产生输出，仅作为轻量级依赖传播机制。

## Workspace 依赖

包通过 `workspace:*` 协议引用其他内部包。例如：

- `@repo/template-app` 依赖 `@repo/ui` 和 `@repo/utils`
- `@repo/ui` 依赖 `@repo/config-vite` 和各种配置包
- `@repo/storybook` 依赖 `@repo/ui`

## Lint 架构

- **oxlint**: Root Task，根目录全局执行（`//#lint:oxlint`），极快扫描全仓库
- **ESLint**: 逐包执行，各包通过 `@repo/config-eslint` 选择 preset，`eslint-plugin-oxlint` 禁用 oxlint 已覆盖的规则
- **lint-staged**: pre-commit 时对暂存文件运行 oxlint → eslint → oxfmt → cspell

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

## Vue 3 开发规范

**必须使用：**

- Composition API with `<script setup>`
- TypeScript
- `<script setup lang="ts">` 格式

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

## pnpm 优势

- **节省磁盘空间** - 使用硬链接和符号链接避免重复下载
- **严格的依赖管理** - 只能访问 `package.json` 中声明的依赖，杜绝"幽灵依赖"
- **Monorepo 原生支持** - 内置 workspace 功能，与 Turborepo 配合效果更佳

## 有用的链接

- [Turborepo 文档](https://turborepo.dev/docs)
- [Turborepo 缓存](https://turborepo.dev/docs/crafting-your-repository/caching)
- [pnpm 官方文档](https://pnpm.io/)
- [pnpm Workspace](https://pnpm.io/workspaces)
