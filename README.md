# Bun + Turborepo Monorepo

基于 Bun + Turborepo 构建的 Vue 3 Monorebo 项目模板，用于开发可共享的 UI 组件库和应用程序。

## 特性

- **Bun** - 现代化的 JavaScript 运行时和包管理器
- **Turborepo** - 高性能的 Monorepo 构建系统
- **Vue 3** - 使用 Composition API + `<script setup>` + TypeScript
- **Vite 7** - 极速的前端构建工具
- **Element Plus** - Vue 3 UI 组件库
- **UnoCSS** - 原子化 CSS 引擎
- **Pinia** - Vue 状态管理库
- **Vitest** - 基于 Vite 的测试框架

## 项目结构

```
bun-turborepo/
├── apps/
│   └── template-app/          # Vue 3 应用程序模板
├── packages/
│   ├── eslint-config/         # 共享 ESLint 配置
│   ├── prettier-config/       # 共享 Prettier 配置
│   ├── spell-config/          # 共享 CSpell 配置
│   ├── typescript-config/     # 共享 TypeScript 配置
│   ├── test-config/           # 共享 Vitest 配置
│   ├── vite-config/           # 共享 Vite 配置
│   ├── unocss-config/         # 共享 UnoCSS 配置
│   ├── utils/                 # 工具函数库（使用 tsdown 构建）
│   └── ui/                    # Vue 3 UI 组件库（使用 Vite 构建）
├── turbo.json                 # Turborepo 配置
└── package.json                # Bun workspace 配置
```

## 快速开始

### 环境要求

- Node.js >= 22
- Bun >= 1.0.0
- 包管理器：bun@1.3.8

### 安装依赖

```bash
bun install
```

### 开发

启动所有开发服务器：

```bash
bun run dev
```

启动特定包的开发服务器：

```bash
# 仅启动 template-app
bun run --filter @repo/template-app dev

# 仅启动 ui 包的开发模式
bun run --filter @repo/ui dev
```

### 构建

构建所有包：

```bash
bun run build
```

构建特定包：

```bash
# 仅构建 ui 包
bun run --filter @repo/ui build

# 构建特定包及其依赖
bun run --filter @repo/template-app... build
```

## 可用命令

### 根级别命令

| 命令             | 说明                           |
| ---------------- | ------------------------------ |
| `bun run build`  | 构建所有包                     |
| `bun dev`        | 启动所有开发服务器             |
| `bun lint`       | Lint 所有包                    |
| `bun format`     | 格式化所有代码                 |
| `bun spell`      | 拼写检查                       |
| `bun type-check` | 类型检查                       |
| `bun run test`   | 运行所有测试                   |
| `bun test:watch` | 运行测试监视模式               |
| `bun app:new`    | 创建新的 workspace（应用或包） |
| `bun app:copy`   | 复制现有 workspace             |
| `bun commit`     | 提交代码（使用 Commitizen）    |

### 针对特定包的命令

使用 `--filter` 标志针对特定包执行命令：

```bash
# 仅在 ui 包中运行测试
bun run --filter @repo/ui test

# 仅类型检查 template-app
bun --filter @repo/template-app type-check

# 仅 lint utils 包
bun --filter @repo/utils lint
```

### 运行单个测试文件

```bash
# 在 utils 包中运行特定测试文件
bun run --filter @repo/utils test src/utils/date.test.ts

# 在 template-app 中运行特定测试
bun run --filter @repo/template-app test src/components/__tests__/Button.test.ts
```

## 技术栈

### 前端框架

- **Vue 3** - 渐进式 JavaScript 框架
  - Composition API + `<script setup>`
  - TypeScript 5.9
- **Vite 7** - 下一代前端构建工具
- **Element Plus** - Vue 3 UI 组件库
- **UnoCSS** - 即时原子化 CSS 引擎
- **Pinia** - Vue 状态管理库

### 开发工具

- **TypeScript** - JavaScript 的超集
- **ESLint** - 代码 lint 工具
- **Prettier** - 代码格式化工具
- **CSpell** - 代码拼写检查工具
- **Vitest** - 单元测试框架
- **Commitizen** - 规范化 Git 提交信息
- **Commitlint** - Git 提交信息检查
- **Husky** - Git hooks 管理
- **lint-staged** - Git 暂存文件检查

### 构建工具

- **Turborepo** - 高性能 Monorepo 构建系统
  - 智能缓存和并行执行
  - 增量构建
  - 远程缓存支持
- **Bun** - 快速的 JavaScript 运行时和包管理器
  - 原生 workspace 支持
  - 快速的依赖安装

## 包类型

### 配置包

以下包使用 **tsdown** 构建：

- `@repo/vite-config` - Vite 配置
- `@repo/test-config` - Vitest 配置
- `@repo/unocss-config` - UnoCSS 配置

### 工具库

- `@repo/utils` - 工具函数库（使用 tsdown 构建）

### UI 组件库

- `@repo/ui` - Vue 3 UI 组件库（使用 Vite 构建）

### 应用程序

- `@repo/template-app` - Vue 3 应用程序模板（使用 Vite 构建）

## Turborepo 任务管道

关键任务依赖关系：

- **build**: 依赖 `^build`（依赖包必须先构建）
- **dev**: 依赖 `^build`（依赖包必须先构建），禁用缓存，持久化任务
- **lint**: 依赖 `transit`（构建转换任务）
- **type-check**: 依赖 `transit`
- **test**: 依赖 `transit`，输出到 `coverage/`
- **test:watch**: 禁用缓存，持久化任务

`transit` 是一个内部任务，用于处理源文件的构建转换，依赖 `^transit`。

## Workspace 依赖

包通过 `workspace:*` 协议引用其他内部包。例如：

- `@repo/template-app` 依赖 `@repo/ui` 和 `@repo/utils`
- `@repo/ui` 依赖 `@repo/vite-config` 和各种配置包

## Git 工作流

### 提交规范

项目使用 Commitizen + Commitlint 进行提交规范检查。

运行 `bun commit` 会启动交互式提交界面，支持：

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

### Lint-staged

Git pre-commit hook 通过 Husky + lint-staged 自动执行：

- ESLint（自动修复）
- Prettier（格式化）
- CSpell（拼写检查）

## 创建新包或应用

### 使用 Turborepo generator

```bash
# 创建新的应用或包
bun app:new

# 复制现有的应用或包
bun app:copy
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

## Bun 与内置命令的注意事项

Bun 有一些内置命令会与 package.json 中的脚本冲突：

- `bun build` - Bun 的内置构建命令，会使用 Bun 的打包系统
- `bun test` - Bun 的内置测试命令，会使用 Bun 的测试运行器

因此，运行构建和测试时需要使用 `bun run` 来执行 package.json 中定义的脚本：

```bash
# 正确：使用 turbo 运行构建
bun run build

# 错误：会使用 Bun 的内置构建命令
bun build

# 正确：使用 turbo 运行测试
bun run test

# 错误：会使用 Bun 的内置测试命令
bun test
```

其他命令（如 `dev`、`lint`、`format` 等）可以直接使用 `bun <command>` 的形式。

## 有用的链接

了解更多关于 Turborepo 的信息：

- [任务](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [缓存](https://turborepo.dev/docs/crafting-your-repository/caching)
- [远程缓存](https://turborepo.dev/docs/core-concepts/remote-caching)
- [过滤](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [配置选项](https://turborepo.dev/docs/reference/configuration)
- [CLI 用法](https://turborepo.dev/docs/reference/command-line-reference)

## 许可证

MIT
