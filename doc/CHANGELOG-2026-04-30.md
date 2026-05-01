# 变更记录 — 2026-04-30

本次变更涵盖 Turborepo 配置修复、依赖升级、template-app 基础设施升级、子包设计问题修复。

---

## 一、依赖升级

| 依赖                     | 旧版本  | 新版本   | 原因                                           |
| ------------------------ | ------- | -------- | ---------------------------------------------- |
| Vite                     | ^7.x    | ^8.0.8   | Vite 8 使用 Rolldown 替代 Rollup，构建性能更好 |
| TypeScript               | ~5.9.x  | ~6.0.0   | TS 6 新版本升级                                |
| Vue                      | ^3.5.x  | ^3.5.32  | 补丁版本更新                                   |
| Vitest                   | ^4.0.x  | ^4.1.4   | 补丁版本更新                                   |
| oxlint                   | ~1.53.x | ~1.62.0  | 功能更新 + 规则改进                            |
| eslint-plugin-oxlint     | ~1.53.x | ~1.62.0  | 与 oxlint 版本对齐                             |
| oxfmt                    | ^0.40.x | ^0.47.0  | 格式化器更新                                   |
| @vitejs/plugin-vue       | ^5.x    | ^6.0.6   | 适配 Vite 8                                    |
| vite-plugin-vue-devtools | ^7.x    | ^8.1.1   | 适配 Vite 8                                    |
| @types/node              | ^22.x   | ^24.10.9 | 适配 Node 24                                   |
| typescript-eslint        | ^8.x    | ^8.59.0  | 补丁更新                                       |
| jsdom                    | ^26.x   | ^29.0.2  | 大版本更新                                     |

**保持不变的依赖：**

| 依赖   | 版本    | 原因                                                                                               |
| ------ | ------- | -------------------------------------------------------------------------------------------------- |
| ESLint | ^9.39.2 | ESLint 10 与 typescript-eslint@8.x 不兼容（`Class extends value undefined`），等待生态兼容后再升级 |

---

## 二、Turborepo 配置修复

### 2.1 删除死配置 `//#format` 和 `//#format:fix`

- **文件**: `turbo.json`
- **操作**: 删除 `//#format` 和 `//#format:fix` 任务定义
- **原因**: `format`/`format:check` 在 `package.json` 中直接调用 `oxfmt`，不经过 turbo 调度，这些 turbo 配置永远不会被触发

### 2.2 修复 `//#lint:root` inputs 路径

- **文件**: `turbo.json`
- **改前**: `["!apps", "!packages", "packages/config-eslint/base.js", "*.{js,...}"]`
- **改后**: `["$TURBO_ROOT$/*.{js,ts,mjs,cjs,vue}", "$TURBO_ROOT$/packages/config-eslint/src/*.js"]`
- **原因**: 原配置使用 `!apps`/`!packages` 排除模式来限定根目录范围，不够明确。改用 `$TURBO_ROOT$` 前缀直接匹配根目录文件，语义更清晰。同时修正了 eslint 配置文件的实际路径（`src/base.js` 而非 `base.js`）。

### 2.3 修复 `spell` 任务 inputs 路径

- **文件**: `turbo.json`
- **改前**: `$TURBO_ROOT$/packages/config-spell/index.js`
- **改后**: `$TURBO_ROOT$/packages/config-spell/src/index.js`
- **原因**: 实际文件位于 `src/` 子目录，原路径指向不存在的位置，导致 config-spell 修改后不会触发 spell 任务的缓存失效

### 2.4 `dev` 任务保持 `^build` 依赖

- **文件**: `turbo.json`
- **操作**: 未修改，保持 `dependsOn: ["^build"]`
- **原因**: `dev` 任务需要依赖包的实际构建产物（`dist/`），`transit` 不产生输出，无法满足需求。`^build` 有缓存机制，依赖包未变化时构建近乎瞬间完成。

### 2.5 `pnpm.onlyBuiltDependencies` 合并

- **文件**: `pnpm-workspace.yaml`, `package.json`
- **操作**: 将 `esbuild` 加入 `pnpm-workspace.yaml` 的 `onlyBuiltDependencies`，删除 `package.json` 中的重复声明
- **原因**: pnpm 官方推荐在 `pnpm-workspace.yaml` 统一管理，避免配置分散

---

## 三、移除 vite-plugin-font

- **文件**: `packages/config-vite/package.json`, `packages/config-vite/src/plugins/vite.ts`
- **操作**: 移除 `vite-plugin-font` 依赖和 `Font.vite()` 插件调用
- **原因**: `vite-plugin-font` 底层依赖 `cn-font-split`，其 native library（koffi）在 Windows 上频繁导致构建失败。移除后字体资源分类（`fonts/` 目录）保留不受影响。

---

## 四、Vite 8 构建配置迁移

### 4.1 rollupOptions → rolldownOptions

- **文件**: `packages/config-vite/src/options/build.ts`
- **操作**: 将 `rollupOptions` 替换为 `rolldownOptions`
- **原因**: Vite 8 内置 Rolldown 替代 Rollup，对应的配置键名已更改

### 4.2 添加 advancedChunks

- **文件**: `packages/config-vite/src/options/build.ts`
- **操作**: 添加 `advancedChunks` 配置，将 node_modules 拆分为三个 chunk：
  - `framework`（优先级 20）: vue, @vue/\*, vue-router, pinia
  - `element-plus`（优先级 15）: element-plus 相关
  - `vendor`（优先级 10）: 其他第三方依赖
- **原因**: 利用 Rolldown 的 advancedChunks 特性实现更细粒度的代码分割，提高缓存命中率

---

## 五、TypeScript 配置修复

### 5.1 移除 `exactOptionalPropertyTypes`

- **文件**: `packages/config-typescript/src/tsconfig.base.json`
- **操作**: 删除 `exactOptionalPropertyTypes: true`
- **原因**: 该选项不属于 `strict` 系列，TypeScript 官方不推荐启用。启用后 `prop?: string` 只允许 string 或 absent（不允许 undefined），与 Element Plus 等库的类型定义冲突，导致类型错误。TS 6 下该问题更加明显。

---

## 六、Template-App 基础设施升级

### 6.1 添加 .env 文件

- **新建**: `apps/template-app/.env` — `BROWSER=chrome`
- **新建**: `apps/template-app/.env.development` — 开发环境变量（VITE_APP_TITLE, VITE_PORT, VITE_BASE_API 等）
- **新建**: `apps/template-app/.env.production` — 生产环境变量
- **原因**: 参考 vue3-ts-starter 项目，为模板应用提供环境变量支持，Vite 自动加载对应环境的 .env 文件

### 6.2 更新 index.html

- **文件**: `apps/template-app/index.html`
- `<html lang="">` → `<html lang="zh-CN">`
- `<title>Vite App</title>` → `<title>%VITE_APP_TITLE%</title>`
- **原因**: 正确设置语言标签（无障碍访问），动态读取环境变量作为页面标题

### 6.3 简化 App.vue

- **文件**: `apps/template-app/src/App.vue`
- 移除 create-vue 默认的 header/nav/logo 占位内容
- 改为 `el-config-provider` 包裹 `router-view`，配置 zh-cn locale
- **原因**: 模板应用应包含最小可用的生产配置，Element Plus 国际化是常见需求

### 6.4 更新 main.ts 样式导入

- **文件**: `apps/template-app/src/main.ts`
- 移除 `./assets/main.css` 导入
- 添加 `@/assets/styles/index.scss` 全局样式
- 导入顺序: `@csstools/normalize.css` → `virtual:uno.css` → `index.scss` → `@repo/ui/style.css`
- **原因**: 统一样式体系，使用 SCSS 作为全局样式方案，UnoCSS 处理原子化 CSS

### 6.5 替换样式体系

- **删除**: `src/assets/base.css`, `src/assets/main.css`
- **新建**: `src/assets/styles/index.scss` — 全局 reset（box-sizing, list-style）
- **原因**: 移除 create-vue 脚手架的默认样式，使用项目自己的 SCSS 体系

### 6.6 清理 create-vue demo 组件

- **删除**: `TheWelcome.vue`, `WelcomeItem.vue`, `icons/` 目录（5 个 icon 组件）
- **保留**: `HelloWorld.vue` + 测试文件（作为组件测试示例）
- **原因**: 模板应用不需要脚手架的演示组件

### 6.7 添加 .vscode/settings.json

- **新建**: `apps/template-app/.vscode/settings.json`
- 配置: 文件嵌套（fileNesting）、保存时格式化（formatOnSave with oxc）、CodeActionsOnSave
- **原因**: 统一团队 IDE 配置，使用 oxc 作为默认格式化器

---

## 七、Oxlint 集成统一

### 7.1 UI 包 oxlint 集成方式修正

- **文件**: `packages/ui/eslint.config.js`
- **改前**: `pluginOxlint.configs['flat/recommended']`
- **改后**: `pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json')`
- **原因**: `buildFromOxlintConfigFile` 从 `.oxlintrc.json` 读取规则，保持 ESLint 插件和 oxlint CLI 使用同一套规则源，避免规则不一致

### 7.2 Storybook 添加 oxlint 支持

- **新建**: `apps/storybook/.oxlintrc.json` — eslint, typescript, unicorn, oxc, vue 插件
- **修改**: `apps/storybook/eslint.config.js` — 添加 oxlint 集成
- **修改**: `apps/storybook/package.json` — 添加 eslint-plugin-oxlint + oxlint 依赖
- **原因**: Storybook 应用之前缺少 oxlint 集成，lint 检查不完整

---

## 八、子包设计问题修复

### 8.1 config-spell: 修复 `main` 字段

- **文件**: `packages/config-spell/package.json`
- **改前**: `"main": "index.js"`（文件不存在）
- **改后**: `"main": "./src/index.js"`
- **原因**: `main` 字段指向不存在的文件，虽然 `exports` 优先级更高可以正常工作，但 `main` 字段应保持准确以兼容旧的工具链

### 8.2 utils: 统一测试目录命名

- **文件**: `packages/utils/src/time/`
- **改前**: `__test__/`（单数）
- **改后**: `__tests__/`（复数）
- **原因**: 与 `src/math/__tests__/` 保持一致，统一使用复数形式（业界惯例）

### 8.3 ui: 修复测试无文件报错

- **文件**: `packages/ui/package.json`
- **改前**: `"test": "vitest run"`
- **改后**: `"test": "vitest run --passWithNoTests"`
- **原因**: 当前无测试文件，vitest 会以 exit code 1 失败，导致 `pnpm test` 整体失败。`--passWithNoTests` 允许在无测试文件时正常退出

### 8.4 ui: 组件文件名 PascalCase 规范

- **文件**: `packages/ui/src/components/input/input.vue`
- **改前**: `input.vue`（小写）
- **改后**: `Input.vue`（PascalCase）
- **同步修改**: `index.ts` 中的导入路径
- **原因**: Vue 官方风格指南推荐组件文件名使用 PascalCase，与 `Button.vue` 保持一致

### 8.5 utils: 添加 `skipNodeModulesBundle`

- **文件**: `packages/utils/tsdown.config.ts`
- **操作**: 添加 `skipNodeModulesBundle: true`
- **原因**: 工具库不应将 node_modules 打包进产物，依赖应由消费者解析

---

## 九、CLAUDE.md 更新

- 移除不存在的 `packages/config-prettier` 和 `prettier.config.js` 引用（已迁移到 oxfmt）
- 修正包名：`eslint-config` → `config-eslint` 等（反映之前的重命名）
- 更新版本号：TypeScript 5.9 → 6, Vite 7 → 8
- 补充 Storybook 应用描述
- 补充 Oxlint/oxfmt 工具链说明
- 修正测试文件路径示例
- 添加组件文件名 PascalCase 规范
- 更新 lint-staged 说明（Prettier → oxfmt）

---

## 十、未修改的设计观察（供参考）

以下问题已识别但未在本轮修改，可作为后续优化方向：

1. **config-vite 的 `defaultCssOptions` 硬编码了 `@/assets/styles/scss-variables.scss` 路径** — 消费者必须创建此文件，否则 SCSS 编译失败。建议改为可选配置。

2. **config-vite 未依赖 `@repo/config-spell`** — 其他构建配置包（config-test, config-unocss）都有此依赖，config-vite 缺失导致模式不一致。

3. **test 任务 outputs 警告** — `coverage/**` 在默认测试（无 coverage）时不会产生文件。可考虑将 `outputs` 改为 `[]` 或在 CI 中单独配置 coverage。

4. **input 组件目录名仍为小写 `input/`** — 文件已改为 `Input.vue`，但目录名仍为 `input`。Vue 对目录命名无强约束，但统一为 `inputs/` 或 `Input/` 会更一致。
