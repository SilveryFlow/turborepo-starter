# Monorepo工程管理

## 一、概念

Monorepo 指用一个代码仓库管理多个应用（apps）和多个共享包（packages），并统一：

- 依赖安装
- 构建流程
- 代码规范
- 版本管理

典型结构：

```bash
.
├─ apps/              # 应用
│   ├─ web/
│   └─ admin/
├─ packages/          # 共享包
│   ├─ ui/
│   ├─ utils/
│   ├─ tsconfig/      # TS 配置包
│   ├─ eslint-config/ # ESLint 配置包
│   └─ prettier-config/
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json
```

适用场景：

- 多前端应用共享 UI 组件库
- 工具库复用
- 统一 TS / ESLint / Git 规范
- 需要多包版本管理（内部或对外）

Monorepo 工程的核心问题：

1. 如何管理 workspace 与依赖？
2. 如何调度构建任务？
3. 如何共享代码？
4. 提交流程规范如何统一？
5. 如何发布版本？
6. CI/CD 如何执行？

## 二、基础工具选择

### 2.1 monorepo工程能力

一个完整的 Monorepo 至少包含 7 类能力：

1. **Workspace 管理**
2. **构建与任务调度**
3. **运行与开发环境**
4. **代码质量与规范化**
5. **提交工作流**
6. **测试体系**
7. **版本与发布体系**

可以理解为：

> [!IMPORTANT]
>
> ```
> Workspace → Build → Dev → Quality → Commit → Test → Version/Release
> ```

### 2.2 工具分类

#### 1. 基础环境与包管理 (Infrastructure)

- **Node.js**: 运行时环境（版本约束：`>=22.14.0`）
- **pnpm**: 负责 Workspace（工作区）管理、依赖安装及物理软链接策略

#### 2. 任务调度与优化 (Task Orchestration)

- **Turborepo (`turbo`)**: 任务编排中心，负责分析包之间的依赖拓扑、处理增量构建及缓存

#### 3. 开发、构建与运行时 (Core Tech Stack)

- **TypeScript**: 静态类型语言基础
- **Vue 3**: 核心 UI 框架
- **Vite 7**: 全栈构建工具（同时负责 App 的开发服务器和 Library 的打包）

- **tsup**: Node/工具库专用（可选）

#### 4. 代码静态分析与规范 (Quality & Consistency)

- **ESLint**: 逻辑质量检查
- **Prettier**: 纯代码风格格式化
- **CSpell**: 单词拼写检查（防止变量、注释中的低级错误）

#### 5. Git 生命周期守卫 (Workflow Guardrails)

- **Husky**: 管理 Git Hooks 钩子
- **Lint-staged**: 针对暂存区文件的增量检查
- **Commitlint**: 校验 Commit 信息是否符合规范
- **cz-git / commitizen**: 提供交互式命令行，辅助生成规范的提交信息

> [!IMPORTANT]
>
> ```
> lint-staged -> husky -> commitlint -> commitizen
> ```

#### 6. 自动化测试 (Testing)

- **Vitest**: 基于 Vite 的单元测试与组件测试框架
- **@vitest/browser / vitest-browser-vue**: 负责在真实浏览器环境中运行 Vue 组件测试

#### 7. 版本管理与发布 (Versioning & Release)

- **Changesets (`@changesets/cli`)**: 负责多包环境下的版本号计算、Changelog 生成以及发布流程自动化。

### 2.3 工具一览表

```diff
[ Workspace 管理 ]
- pnpm
- Node.js

[ 构建与任务调度 ]
- turborepo

[ 运行与开发环境 ]
- vite
- vue
- @vitejs/plugin-vue
- typescript
- (可选) rollup / tsup

[ 代码质量与规范化 ]
- eslint
- typescript-eslint
- eslint-plugin-vue
- @eslint/js
- globals
- prettier
- eslint-config-prettier
- eslint-plugin-prettier
- cspell

[ 提交工作流 ]
- husky
- lint-staged
- @commitlint/cli
- @commitlint/config-conventional
- commitizen
- cz-git

[ 测试体系 ]
- vitest
- @vitest/browser
- vitest-browser-vue
- @vue/test-utils
(可选)
- playwright
- happy-dom

[ 版本与发布体系 ]
- @changesets/cli
```

## 三、monorepo环境配置

### 3.1 创建turbo项目

```cmd
pnpm dlx create-turbo@latest
```

创建后可以看到根目录的pnpm-workspace.yaml文件内容如下

```yaml
# pnpm-workspace.yaml

packages:
  - "packages/*"
  - "apps/*"
```

#### 1. 清理项目

删除`apps/*`和`packages/ui`文件夹

#### 2. 锁定环境

可以使用npm-check-updates命令行工具或Version Lens扩展检查包版本更新

```json
// package.json
{
  "packageManager": "pnpm@10.28.0",
  "engines": {
    "node": ">=24",
    "npm": ">=11",
    "pnpm": ">=10"
  }
}
```

> [!TIP]
>
> 也可使用volta进行项目环境管理

```bash
# .npmrc
engine-strict=true
```

推荐将.vscode文件夹下的`extensions.json`和`settings.json`也共享，统一编辑器工作区设置

#### 3. pnpm命令

执行工程级命令

```shell
pnpm --workspace-root [...]
```

或

```shell
pnpm -w [...]
```

执行子包命令

```shell
进入子目录中执行
```

或

```shell
pnpm -C 子包路径 [...]
```

### 3.2 typescript共享包

#### 3.2.1 package配置

typescript-config应该分文件进行不同环境的tsconfig配置

```bash
packages/typescript-config/
├── package.json
├── tsconfig.base.json			# 公共基础配置
├── tsconfig.vue.json    		# apps/Vue 业务代码用
├── tsconfig.node.json       	# vite.config.ts 等node环境工具用
├── tsconfig.library.json    	# packages/* 等库用
└── tsconfig.vitest.json		# 测试环境的 TS 配置
```

vue.json这种框架配置通过extends字段继承base.json

typescript-config的package.json如下:

```json
{
  "name": "@repo/typescript-config", 
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
}
```

其中name字段以`@repo/`开头，约定monorepo下的所有子包都以同样的格式命名。即@xxx/xxxx，命名空间要统一。

##### 1. tsconfig.base.json

通用 TS 配置

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "incremental": false,

    "target": "esnext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],

    "module": "esnext",
    "moduleResolution": "bundler",
    "moduleDetection": "force",
    "resolveJsonModule": true,

    "declaration": true,
    "declarationMap": true,

    "isolatedModules": true,
    "esModuleInterop": true,

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    "skipLibCheck": true
  },
  "exclude": ["node_modules", "dist"]
}
```

1.  项目配置(Projects)

| **选项**          | **值**  | **核心作用**                           | **备注**                                                     |
| ----------------- | ------- | -------------------------------------- | ------------------------------------------------------------ |
| **`incremental`** | `false` | **增量编译**：关闭 TS 自身的增量缓存。 | **按需开启策略**：建议在具体的 App 或 Library 配置中显式开启，以配合 `composite` 实现跨项目提速。 |

2. 语言与环境 (Language and Environment)

| **选项**     | **值**                   | **核心作用**                                                 | **备注**                                                     |
| ------------ | ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **`target`** | `"esnext"`               | **目标版本**：指定编译后的 JS 版本。                         | 设为 `esnext` 是因为构建工具（Vite/esbuild）会负责语法降级，TS 只需负责检查，这样构建最快。 |
| **`lib`**    | `["ESNext", "DOM", ...]` | **类型库**：指定环境中有哪些全局对象（如 `Promise`, `window`）。 | 如果是纯 Node 项目（如后端），继承后需覆盖此项去掉 `DOM`。   |

3. 模块系统 (Modules)

| **选项**                | **值**      | **核心作用**                                      | **备注**                                                     |
| ----------------------- | ----------- | ------------------------------------------------- | ------------------------------------------------------------ |
| **`module`**            | `"esnext"`  | **模块规范**：生成 ESM 代码 (`import`/`export`)。 | 现代前端工程（Vite/Rollup）的标准输入格式。                  |
| **`moduleResolution`**  | `"bundler"` | **解析策略**：模拟打包工具的路径解析逻辑。        | **关键配置**：支持 `package.json` 的 `exports` 字段及无扩展名导入，Vite 项目标配。 |
| **`moduleDetection`**   | `"force"`   | **强制模块化**：将所有文件视为模块。              | 避免因忘记写 `export` 导致变量污染全局命名空间。             |
| **`resolveJsonModule`** | `true`      | **JSON 支持**：允许 `import` JSON 文件。          | 导入后会自动推导 JSON 的类型结构。                           |

4. 产物输出 (Emit)

| **选项**             | **值** | **核心作用**                      | **备注**                                                     |
| -------------------- | ------ | --------------------------------- | ------------------------------------------------------------ |
| **`declaration`**    | `true` | **类型声明**：生成 `.d.ts` 文件。 | **必须**：Monorepo 中包被引用时需要它来提供类型提示。        |
| **`declarationMap`** | `true` | **源码映射**：生成 `.d.ts.map`。  | **体验神器**：允许从引用处（Ctrl+左键）直接跳转到 `.ts` 源码，而非 `.d.ts`。 |

5. 互操作性约束 (Interop Constraints)

| **选项**                   | **值** | **核心作用**                                                 | **备注**                                                     |
| -------------------------- | ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **`isolatedModules`**      | `true` | **隔离编译**：确保文件能被单文件转译。                       | **Vite 必需**：防止使用 esbuild 不支持的 TS 特性（如 `const enum`）。 |
| **`esModuleInterop`**      | `true` | **CJS 兼容**：支持默认导入 CommonJS 模块。                   | 允许 `import Vue from 'vue'`。                               |
| **`verbatimModuleSyntax`** | `true` | **显式模块语法**：强制区分类型导入（`import type`）和值导入。 | 配合 `isolatedModules` 使用，确保单文件编译 100% 安全，并能获得最佳的 Tree-shaking 效果。 |

6. 类型检查 (Type Checking)

| **选项**                         | **值** | **核心作用**                                          | **备注**                                                     |
| -------------------------------- | ------ | ----------------------------------------------------- | ------------------------------------------------------------ |
| **`strict`**                     | `true` | **严格模式**：开启全套严格检查。                      | 包含 `noImplicitAny`, `strictNullChecks` 等，代码质量的基线。 |
| **`noUncheckedIndexedAccess`**   | `true` | **索引检查**：访问数组/对象索引时可能为 `undefined`。 | **推荐**：强迫开发者检查 `arr[i]` 是否存在，防止运行时报错。 |
| **`exactOptionalPropertyTypes`** | `true` | **精确可选**：区分“属性不存在”与“值为 undefined”。    | 开启后，`age?: number` 不能显式赋值 `age: undefined`，语义更严谨。 |

7.  完整性(Completeness)

| **选项**           | **值** | **核心作用**                                     | **备注**                                   |
| ------------------ | ------ | ------------------------------------------------ | ------------------------------------------ |
| **`skipLibCheck`** | `true` | **跳过库检查**：不检查 `node_modules` 里的类型。 | 显著提升编译速度，忽略第三方库的类型错误。 |

##### 2. tsconfig.vue.json

前端 Vue app / SPA 项目的 TS 配置

在typescript-config下安装开发依赖`@vue/tsconfig`

```bash
pnpm i -D @vue/tsconfig
```

在vue.json中继承官方配置和base.json

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": ["@vue/tsconfig/tsconfig.dom.json", "./tsconfig.base.json"]
}
```

##### 3. tsconfig.node.json

Node 环境的 TS 配置

在typescript-config下安装开发依赖`@tsconfig/node24`

```bash
pnpm i -D @tsconfig/node24
```

在vue.json中继承官方配置和base.json

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": ["@tsconfig/node24/tsconfig.json", "./tsconfig.base.json"],
  "compilerOptions": {
    "lib": ["ESNext"],

    "types": ["node"]
  }
}
```

1. 语言与环境 (Language and Environment)

| **选项**  | **值**       | **核心作用**                                                 | **备注**                                                   |
| --------- | ------------ | ------------------------------------------------------------ | ---------------------------------------------------------- |
| **`lib`** | `["ESNext"]` | **类型库**：指定环境中有哪些全局对象（如 `Promise`, `window`）。 | 如果是纯 Node 项目（如后端），继承后需覆盖此项去掉 `DOM`。 |

2. 模块系统 (Modules)

| **选项**    | **值**     | **核心作用**                                           | **备注**                   |
| ----------- | ---------- | ------------------------------------------------------ | -------------------------- |
| **`types`** | `["node"]` | **全局类型声明**：仅显式加载列表中定义的全局变量类型。 | 只使用node环境下的全局变量 |

##### 4. tsconfig.library.json

用于打包库（TypeScript 库、npm 包）的 TS 配置

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "incremental": true,

    "emitDeclarationOnly":true
  }
}
```

1. Projects (项目配置)

| **选项**          | **值** | **核心作用**                                                 | **备注**                                                     |
| ----------------- | ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **`composite`**   | `true` | **项目集成模式**：允许该包被其他项目通过 `references` 引用。 | **Monorepo 核心**：开启后，IDE 才能实现跨包跳转源码和实时的类型错误同步。 |
| **`incremental`** | `true` | **增量编译**：保留上次构建的元数据（`.tsbuildinfo`）。       | **强制要求**：开启 `composite` 后必须开启此项，用于加速大型项目中的增量检查。 |

2. Emit (产物输出)

| **选项**                  | **值** | **核心作用**                                                 | **备注**                                                     |
| ------------------------- | ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **`emitDeclarationOnly`** | `true` | **仅产出声明文件**：告诉 `tsc` 只生成 `.d.ts`，禁止生成 `.js`。 | **职责分离关键**：将 JS 转译（ESM/CJS）交给更快的 Vite/tsup，避免 `tsc` 产生冗余代码。 |
| **`declaration`**         | `true` | **生成类型定义**：产出 `.d.ts` 文件。                        | 已从 `base.json` 继承。共享库必须开启，否则消费方（App）无法获得类型提示。 |
| **`declarationMap`**      | `true` | **类型源码映射**：产出 `.d.ts.map` 文件。                    | 已从 `base.json` 继承。允许引用方直接跳转到 `.ts` 源码，极大方便调试。 |

##### 5. tsconfig.vitest.json

测试环境的 TS 配置

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "incremental": true,

    "types": ["node", "jsdom", "vitest/globals", "vite/client"],

    "noEmit": true
  }
}
```

1. Projects (项目配置)

| **选项**          | **值** | **核心作用**                               | **备注**                                             |
| ----------------- | ------ | ------------------------------------------ | ---------------------------------------------------- |
| **`incremental`** | `true` | **增量检查**：启用增量编译，生成缓存文件。 | **性能关键**：显著提升二次运行测试时的类型检查速度。 |

2. Modules (模块系统)

| **选项**    | **值**                   | **核心作用**                                   | **备注**                                                     |
| ----------- | ------------------------ | ---------------------------------------------- | ------------------------------------------------------------ |
| **`types`** | `["node", "jsdom", ...]` | **全局类型加载**：仅显式包含列表中的类型定义。 | **隔离逻辑**： • `node`: 允许在测试中使用 Node 工具。 • `jsdom`: 支持 Web 环境模拟。 • `vitest/globals`: 支持 `describe`/`expect`。 |

3. Emit (产物输出)

| **选项**     | **值** | **核心作用**                                                 | **备注**                                                     |
| ------------ | ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **`noEmit`** | `true` | **禁止输出产物**：强制 `tsc` 不生成任何 `.js` 或 `.d.ts` 文件。 | **职责分离**：测试文件仅用于静态类型检查。实际运行由 Vitest 内部处理，不需要 TS 生成物理文件。 |

#### 3.2.3 app添加package依赖

##### 1. 创建app

packages中的子包可以作为依赖添加到app中。packages中的子包也可以添加package作为依赖。

以vue为例，在apps文件夹通过vite脚手架创建一个vue应用，至少勾选typescript、vitest

```bash
pnpm create vue
```

创建子包后，修改包名。

```json
{
 "name": "@repo/vite-project",
}
```

约定monorepo下的所以子包都以相同的前缀开头，之前的typescript-config包也是按照这个格式命名。

##### 2. 添加typescript-config为依赖

编辑package.json，把typescript-config包添加到开发依赖下。

```json
{
  "devDependencies":{
  	"@repo/typescript-config": "workspace:*"
  }
}
```

`"workspace:*"`表示总是链接本地最新包，忽略具体版本号。

运行`pnpm i`，可以看到app的node_modules文件夹下出现了`@repo/typescript-config`

##### 3. tsconfig继承

app下有这几个tsconfig文件

```
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.vitest.json
```

app的tsconfig是通过项目引用来配置的。tsconfig.json作为入口，引用了三个子配置文件。修改这三个子配置文件的extends为typescript-config下的配置。

```json
// tsconfig.app.json
{
  "extends": "@repo/typescript-config/tsconfig.vue.json", //以包引用的方式继承
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],
  "exclude": ["src/**/__tests__/*"],
  "compilerOptions": {

    "composite": true,
    "incremental": true,

    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",

    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```json
// tsconfig.node.json
{
  "extends": "@repo/typescript-config/tsconfig.node.json",
  "include": [
    "vite.config.*",
    "vitest.config.*",
    "cypress.config.*",
    "nightwatch.conf.*",
    "playwright.config.*",
    "eslint.config.*"
  ],
  "compilerOptions": {
    "composite": true,
    "incremental": true,

    "noEmit": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",

    "module": "ESNext",
    "moduleResolution": "Bundler",
    "types": ["node"]
  }
}

```

```json
// tsconfig.vitest.json
{
  "extends": "@repo/typescript-config/tsconfig.vitest.json",
  "include": ["src/**/__tests__/*", "env.d.ts"],
  "exclude": [],
  "compilerOptions": {
    "composite": true,
    "incremental": true,

    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.vitest.tsbuildinfo",

    "lib": [],
    "types": ["node", "jsdom"]
  }
}
```

继承typescript-conifg子包中的tsconfig。同时ts规定被引用的配置必须开启composite，所以设置composite为true。incremental在composite为true的情况下也强制为true。

| **选项**              | **值** | **核心作用**                                       | **备注**                                                     |
| --------------------- | ------ | -------------------------------------------------- | ------------------------------------------------------------ |
| **`tsBuildInfoFile`** | `path` | **缓存路径重定向**：手动指定增量元数据的存储位置。 | 建议指向 `./node_modules/.tmp/tsconfig.xxx.tsbuildinfo`，避免缓存文件污染源码根目录。 |

配置composite为true后，所有实现文件必须与 `include` 模式匹配。

原本tsconfig.vitest.json的include配置只有测试文件，没有测试文件中引用的被测文件，需要扩大范围。此处直接包含整个src。

```json
{
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"], //从tsconfig.vue.json里复制
}
```

还有可能会出现app的eslint.config.ts错误，需要给导出显示设置类型

```typescript
// 显式导入类型，帮助 TS 确定类型来源
import type { Linter } from 'eslint';

// 给导出添加一个通用的类型注解
export default defineConfigWithVueTs(
  // ... 你的配置
) as Linter.Config[];
```

或者直接设置为any。

##### 4. exports导出路径

在继承的时候，如果想要简化路径，可以使用package.json的exports字段

```json
{
  "name": "@repo/typescript-config",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "exports": {
    "./base": "./tsconfig.base.json",
    "./vue": "./tsconfig.vue.json",
    "./node": "./tsconfig.node.json",
    "./library": "./tsconfig.library.json",
    "./vitest": "./tsconfig.vitest.json"
  },
  "publishConfig": {
    "access": "public"
  },
  "devDependencies": {
    "@tsconfig/node24": "^24.0.3",
    "@types/jsdom": "^27.0.0",
    "@types/node": "^24.10.9",
    "@vue/tsconfig": "^0.8.1",
    "vite": "^7.3.1",
    "vitest": "^4.0.17"
  }
}
```

这样会限制app对typescript-config的json文件访问，没有被配置的就无法访问，且无法再使用之前的路径访问。

### 3.3 eslint共享包

#### 3.3.1 规则配置

eslint-config目录结构如下

```bash
.
├── base.js
├── next.js
├── package.json
├── react-internal.js
└── README.md
```

base.js中进行了基础配置，每个环境继承base配置并作各自定制化。

查看package.json

```json
{
  "name": "@repo/eslint-config",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "exports": {
    "./base": "./base.js",
    "./next-js": "./next.js",
    "./react-internal": "./react-internal.js"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@next/eslint-plugin-next": "^15.5.0",
    "eslint": "^9.39.1",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-only-warn": "^1.1.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-turbo": "^2.7.1",
    "globals": "^16.5.0",
    "typescript": "^5.9.2",
    "typescript-eslint": "^8.50.0"
  }
}
```

配置通过exports字段导出以供其他子包使用。并且所有依赖都集中在这里，这样其他子包使用时无需重新添加依赖项。

> [!TIP]
>
> 在配置规则时会导入一些依赖包，避免依赖包未添加到devDependencies，使用depcheck进行依赖检查

##### 1. base.js

```js
import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import turboPlugin from 'eslint-plugin-turbo'
import tseslint from 'typescript-eslint'
import onlyWarn from 'eslint-plugin-only-warn'
import globals from 'globals'

/**
 * 共享 ESLint 配置
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  //JS规则
  js.configs.recommended,
  //TS规则
  ...tseslint.configs.recommended,

  //关闭与Prettier冲突的规则
  eslintConfigPrettier,

  //定义全局变量
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  //Turbo规则
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },

  //将error转换为warn
  {
    plugins: {
      onlyWarn,
    },
  },
  //忽略文件
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.d.ts'],
  },
]
```

##### 2. vue.js

```js
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { config as baseConfig } from './base.js'

/**
 * Vue 3 + TypeScript 项目的 ESLint 配置
 */
export const config = defineConfigWithVueTs(
  // 继承基础配置
  ...baseConfig,

  // Vue 3 推荐规则
  ...pluginVue.configs['flat/essential'],

  // Vue + TypeScript 推荐规则
  vueTsConfigs.recommended,

  // 自定义规则
  {
    name: 'repo/vue/custom',
    files: ['**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'warn', // 多单词组件名称警告
    },
  },

  // 跳过格式化（交给 Prettier）
  skipFormatting,
)

```

##### 3. vitest.js

```js
import pluginVitest from '@vitest/eslint-plugin'
import { config as baseConfig } from './base.js'

/**
 * 纯 TypeScript 项目的 Vitest 配置
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...baseConfig,
  {
    name: 'repo/vitest',
    files: ['**/*.spec.ts', '**/*.test.ts'],
    plugins: {
      vitest: pluginVitest,
    },
    rules: {
      ...pluginVitest.configs.recommended.rules,
      'vitest/no-focused-tests': 'warn', // 不允许提交带有 .only 的测试
    },
  },
]
```

##### 4. vitest-vue

```js
import pluginVitest from '@vitest/eslint-plugin'
import { config as vueConfig } from './vue.js'

/**
 * Vue 3 + TypeScript 项目的 Vitest 配置
 * 直接基于已经处理过 .vue 解析的 vueConfig 进行增强
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...vueConfig,
  {
    name: 'repo/vitest-vue',
    files: ['**/__tests__/**', '**/*.spec.{ts,vue}', '**/*.test.{ts,vue}'],
    plugins: {
      vitest: pluginVitest,
    },
    rules: {
      ...pluginVitest.configs.recommended.rules,
    },
  },
]
```

#### 3.3.2 在子包中使用

##### 1.  添加为依赖

在eslint-config的package.json中通过exports字段配置规则的导出路径

```json
{
  "name": "@repo/eslint-config",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "exports": {
    "./base": "./base.js",
    "./vue": "./vue.js",
    "./vitest": "./vitest.js",
    "./vitest-vue": "./vitest-vue.js"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@vitest/eslint-plugin": "^1.6.6",
    "@vue/eslint-config-prettier": "^10.2.0",
    "@vue/eslint-config-typescript": "^14.6.0",
    "eslint": "^9.39.1",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-only-warn": "^1.1.0",
    "eslint-plugin-turbo": "^2.7.5",
    "eslint-plugin-vue": "~10.7.0",
    "globals": "^17.0.0",
    "typescript": "^5.9.2",
    "typescript-eslint": "^8.50.0",
    "vue-eslint-parser": "^10.2.0"
  }
}
```

在需要依赖eslint-config的子包devDependencies中添加@repo/eslint-config

```json
{
  "devDependencies":{
  	"@repo/eslint-config": "workspace:*"
  }
}
```

##### 2. 规则继承

以`pnpm create vue`得到的vue3+ts+vitest为例

1. ***原本配置***

```js
import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import pluginOxlint from 'eslint-plugin-oxlint'
import type { Linter } from 'eslint';

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  skipFormatting,

  ...pluginOxlint.configs['flat/recommended'],
) as Linter.Config[];
```

2. ***使用子包***

eslint的配置没有必要使用ts格式，改为js格式避免干扰构建

```js
import { config as vitestVueConfig } from '@repo/eslint-config/vitest-vue'
import pluginOxlint from 'eslint-plugin-oxlint'

/**
 * Vue 应用的 ESLint 配置
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  // 指定文件范围
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,js,ts,mts,tsx}'],
  },

  // 应用级忽略规则
  {
    name: 'app/ignores',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/.vitepress/cache/**'],
  },

  // vitest-vue 测试配置
  ...vitestVueConfig,

  // Oxlint 性能优化（可选）
  ...pluginOxlint.configs['flat/recommended'],
]
```

##### 3. 清理app依赖

可以通过depcheck检查不再被直接使用的依赖，删除掉

### 3.4 prettier共享包

在packages下创建prettier-config文件夹，进入文件夹后运行pnpm init，在文件夹下添加index.js文件

```bash
.
├── index.js
└── package.json
```

修改package.json如下

```json
{
  "name": "@repo/prettier-config",
  "version": "0.0.0",
  "main": "index.js",
  "type": "module",
  "private": true,
  "exports": {
    ".": "./index.js"
  }
}
```

#### 3.4.1 规则配置

在prettier-config中安装prettier为开发依赖

```
pnpm i -D prettier
```

编写index.js

```js
/**
 * @type {import('prettier').Config}
 */
export default {
  // 1. 单行长度
  printWidth: 120,

  // 2. 使用单引号
  singleQuote: true,

  // 3. 不在语句末尾加分号
  semi: false,

  // 4. 箭头函数只有一个参数时省略括号
  arrowParens: 'avoid',
}
```

#### 3.4.2 在子包中使用

##### 1. 添加为依赖

在子包的package.json和根目录的package.json添加prettier-config

```json
{
  "devDependencies":{
  	"@repo/prettier-config": "workspace:*"
  }
}
```

##### 2. 规则配置

在根目录和子包内创建prettier.config.js文件，删除其他格式的prettier配置文件

```js
import repoConfig from "@repo/prettier-config";

/**
 * @type {import('prettier').Config}
 */
export default {
  ...repoConfig,
};
```

> [!NOTE]
>
> `export`是ES Module模块体系语法，所以还需要设置package.json的type字段为`module`

同时需要在根目录和每个子包下添加`.prettierignore`文件。prettier会读取git等版本控制工具的忽略文件，结合prettier自己的忽略文件去跳过指定内容的格式化

```
# --- 依赖与构建 (Build & Dependencies) ---
node_modules/
dist/
dist-ssr/
*.local

# --- Turborepo & 缓存 (Cache) ---
.turbo/
.cache/
.temp/
*.tsbuildinfo

# --- 测试 (Vitest & Coverage) ---
coverage/
test-results/
__snapshots__/

# --- 静态资源 (Static Assets) ---
# 建议忽略 public 目录，因为里面通常是第三方库或大型 SVG
public/
*.min.js
*.min.css
*.svg
*.png
*.jpg
*.jpeg
*.gif
*.ico

# --- 配置文件与锁文件 (Config & Lock) ---
# 锁文件千万不要格式化，会导致校验失败或 Diff 爆炸
pnpm-lock.yaml
package-lock.json
yarn.lock

# --- IDE & 系统 (System) ---
.vscode/
.idea/
.DS_Store
*.log
.eslintcache

# --- 自动生成的文件 (Auto-generated) ---
# 如果用了插件自动生成类型（如 unplugin-auto-import）
auto-imports.d.ts
components.d.ts
```

##### 3.  规则使用--根目录 Prettier

在根目录的package.json中配置prettier的script

```json
{
  "name": "pnpm-turborepo",
  "scripts": {
    "format": "prettier --write --experimental-cli . --ignore-unknown --cache --cache-location .prettiercache"
  }
}
```

运行`pnpm format`，此时prettier会直接采用根目录下的prettier.config.js和.prettierignore，对整个monorepo进行format。会无视每个子包各自的配置和忽略。

##### 4. 规则使用--Turbo 调度

在每个子包的package.json中配置prettier的script

```json
{
  "name": "@repo/xxxx",
  "scripts": {
    "format": "prettier --write --experimental-cli . --ignore-unknown --cache --cache-location .prettiercache"
  }
}
```

配置根目录下的`turbo.json`,在tasks下添加format

```json
{
  "tasks": {
    "format": {
      "inputs": [
        "$TURBO_DEFAULT$", 
        "**/*.{js,ts,vue,json,css,md}",
        "../../packages/prettier-config/index.js" 
      ],
      "outputs": [] 
    }
  }
}
```

此时在根目录运行`turbo format`，turbo会调度各个子包的format的script，每个子包都会有一个prettier进程，读取各自的配置和忽略文件。如果子包内没有format的script，就不执行。

turbo调度不会启动根目录的prettier，因为turbo只会调度位于workspace的内容，也就是`apps/**`和`packages/**`

所以可以在根目录的package.json中设置如下script

```json
"scripts": {
  "format": "turbo run format && prettier --write --experimental-cli \"*.{json,md}\" --ignore-unknown"
}
```

这样在根目录运行`pnpm format`

- `turbo run format`：负责调度所有子包。

- `prettier --write ...`：负责格式化根目录下的零散文件（如 `README.md`）。

### 3.5 vite共享包

运行`pnpm init --init-type module`初始化`@repo/vite-config`子包，创建src/index.ts，修改package.json如下

```json
{
  "name": "@repo/vite-config",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "exports": {
    ".": "./src/index.ts"
  }
}
```

#### 3.5.1 子包环境

1. 安装vite、typescript为开发依赖

```bash
 pnpm i -D vite typescript @types/node
```

2. 添加typescript-config、eslint-config、prettier-config子包为开发依赖

```json
{
  "name": "@repo/vite-config",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "exports": {
    ".": "./src/index.ts"
  },
  "devDependencies": {
    "@types/node": "^25.0.10",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "@repo/eslint-config": "workspace:*",
    "@repo/prettier-config": "workspace:*",
    "@repo/typescript-config": "workspace:*"
  }
}
```

运行`pnpm i`

3. 配置tsconfig.json

```json
{
  "extends": "@repo/typescript-config/tsconfig.node.json",
  "compilerOptions": {
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src/**/*.ts"]
}
```

4. 配置eslint

安装eslint

```
pnpm i -D eslint
```

修改eslint.config.js

```js
import { config as baseConfig } from "@repo/eslint-config/base";

/**
 * Vue 应用的 ESLint 配置
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  // 指定文件范围
  {
    name: "app/files-to-lint",
    files: ["**/*.{vue,js,ts,mts,tsx}"],
  },

  // 应用级忽略规则
  {
    name: "app/ignores",
    ignores: [
      "**/dist/**",
      "**/dist-ssr/**",
      "**/coverage/**",
      "**/.vitepress/cache/**",
    ],
  },

  ...baseConfig,
];
```

在package.json的scripts中添加

```json
"lint": "eslint . --fix --cache",
```

5. 配置prettier

修改prettier.config.js

```js
import repoConfig from '@repo/prettier-config'

/**
 * @type {import('prettier').Config}
 */
export default {
  ...repoConfig,
}
```

参考3.4.2配置.prettierignore文件

在package.json的scripts中添加

```json
"format": "prettier --write --experimental-cli . --ignore-unknown --cache --cache-location .prettiercache"
```

#### 3.5.2 规则配置

> [!NOTE]
>
> vite的配置组合大于继承

```bash
packages/vite-config/
├── src/
│   ├── plugins/
│   │   ├── index.ts      # 插件聚合导出
│   │   └── vue.ts        # Vue 相关插件配置
│   ├── options/
│   │   ├── build.ts      # 构建混淆、压缩、分包
│   │   └── server.ts     # 开发服务器默认配置
│   ├── utils/
│   │   └── alias.ts      # 路径解析工具
│   └── index.ts          # 主入口，导出各模块
├── package.json
└── tsconfig.json
```

