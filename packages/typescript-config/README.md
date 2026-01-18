### typescript共享包

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