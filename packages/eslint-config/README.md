# `@turbo/eslint-config`

Collection of internal eslint configurations.

### eslint共享包

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

