# 变更记录 — 2026-05-01

本次变更涵盖子包配置优化、Turborepo 配置调整、模板应用配置优化、根目录基础设施补齐。

---

## 一、config-vite 工厂函数重构

将静态导出的配置对象改为带参数的工厂函数，消费者可按需覆盖默认值。

### 1.1 vitePluginPreset — compression 仅在 build 时启用

- **文件**: `packages/config-vite/src/plugins/vite.ts`
- **问题**: `compression()` 在 dev 和 build 时都运行，dev 模式下生成 `.gz` 文件是浪费
- **方案**: 改为工厂函数，接收 `{ command }` 参数，仅在 `command === 'build'` 时启用 compression

### 1.2 Icons autoInstall 关闭

- **文件**: `packages/config-vite/src/plugins/vue.ts`
- **问题**: `autoInstall: true` 在 CI 中可能意外修改 `node_modules`，pnpm 严格 lockfile 下会出问题
- **方案**: 改为 `autoInstall: false`，要求开发者手动安装 icon 集合

### 1.3 CSS/Build/Serve 选项改为工厂函数

- **文件**: `packages/config-vite/src/options/css.ts`、`build.ts`、`serve.ts`
- **问题**: 导出静态对象，消费者无法覆盖硬编码的路径和默认值
- **方案**:
  - `defaultCssOptions` → `createCssOptions({ scssVariablesPath? })` — 可覆盖或禁用 SCSS 变量路径
  - `defaultBuildOptions` → `createBuildOptions({ chunkGroups? })` — 可自定义 chunk 分组
  - `defaultServeOptions` → `createServeOptions({ warmupFiles? })` — 可覆盖 warmup 文件列表
  - 保留旧名称作为 `@deprecated` 别名，向后兼容

---

## 二、config-vite 拆分：移除 Vue 应用级预设

### 2.1 问题

config-vite 混合了两种不同层级的关注点：

- **通用 Vite 基础设施**：compression、restart、image-optimizer、UnoCSS、alias、build/css/serve 选项 — 所有 Vite 项目都可能用到
- **Vue 应用级预设**：`vuePluginPreset` 包含 vueDevTools、AutoImport（含 pinia/vue-router/@vueuse）、Components（含 ElementPlusResolver/VChartResolver/IconsResolver）— 只适用于使用 Element Plus + vue-echarts 的 Vue 应用

`@repo/ui` 库包也依赖 config-vite，但只用到了 `createAlias` 和 `createCssOptions`，被迫引入不需要的 Vue 应用级依赖。

### 2.2 方案

- **删除** `packages/config-vite/src/plugins/vue.ts`
- **移除依赖**：从 config-vite 的 `package.json` 移除 `@vitejs/plugin-vue`、`vite-plugin-vue-devtools`、`unplugin-auto-import`、`unplugin-vue-components`、`unplugin-icons`（共 5 个 devDep + peerDep）
- **内联到 template-app**：将 `vuePluginPreset` 的全部逻辑直接写在 `apps/template-app/vite.config.ts` 的 `plugins` 数组中
- **显式声明依赖**：在 template-app 的 `package.json` 添加 `unplugin-auto-import`、`unplugin-vue-components`、`unplugin-icons`

### 2.3 拆分后 config-vite 保留内容

| 导出                 | 类型     | 用途                                          |
| -------------------- | -------- | --------------------------------------------- |
| `vitePluginPreset`   | 插件预设 | compression、restart、image-optimizer、UnoCSS |
| `createAlias`        | 工具函数 | `@` 路径别名                                  |
| `createBuildOptions` | 工厂函数 | rolldown chunk 分割                           |
| `createCssOptions`   | 工厂函数 | SCSS 变量注入                                 |
| `createServeOptions` | 工厂函数 | host/open/warmup                              |

---

## 三、ESLint 配置优化

### 3.1 Vue 规则升级为 flat/recommended

- **文件**: `packages/config-eslint/src/vue.js`
- **问题**: `flat/essential` 只捕获会导致 Vue 抛出的错误，规则较少
- **方案**: 改为 `pluginVue.configs['flat/recommended']`，包含更多最佳实践规则

### 3.2 vitest-vue 补齐 no-focused-tests 规则

- **文件**: `packages/config-eslint/src/vitest-vue.js`
- **问题**: `vitest.js` 有 `vitest/no-focused-tests: 'warn'`，但 `vitest-vue.js` 缺失，不一致
- **方案**: 在 vitest-vue.js 的 rules 中添加同样的规则

---

## 四、TypeScript 配置优化

### 4.1 base 移除 declaration/declarationMap

- **文件**: `packages/config-typescript/src/tsconfig.base.json`、`tsconfig.library.json`
- **问题**: `declaration: true` 和 `declarationMap: true` 只有库包需要，应用包继承后会产生不必要的 `.d.ts` 文件
- **方案**: 从 base 中移除，仅在 `tsconfig.library.json` 中保留

---

## 五、Oxlint 配置统一

### 5.1 删除子包独立 .oxlintrc.json，统一引用根配置

- **删除**: `apps/template-app/.oxlintrc.json`
- **修改**: `apps/template-app/eslint.config.js`、`apps/storybook/eslint.config.js`、`packages/ui/eslint.config.js`
- **问题**: 各子包维护独立的 oxlint 配置，规则容易不一致
- **方案**: 统一使用根目录 `.oxlintrc.json`，子包通过 `buildFromOxlintConfigFile` 引用

---

## 六、oxfmt 忽略配置迁移

### 6.1 从 .oxfmtignore 迁移到 .oxfmtrc.json ignorePatterns

- **删除**: `.oxfmtignore`（自定义文件，通过 `--ignore-path` 加载）
- **修改**: `.oxfmtrc.json` — 添加 `ignorePatterns` 数组
- **问题**: `.oxfmtignore` 不是 oxfmt 官方配置文件，官方推荐使用 `ignorePatterns`
- **方案**: 将自定义忽略项迁移到 `.oxfmtrc.json` 的 `ignorePatterns` 字段，移除冗余项（`node_modules`、lock 文件已由 oxfmt 默认忽略）
- **同步修改**: `package.json` 和 `lint-staged.config.js` 移除 `--ignore-path .oxfmtignore` 参数

---

## 七、Turborepo 配置调整

### 7.1 format/spell 配置为 Root Task

- **文件**: `turbo.json`、`package.json`
- **方案**: `format`、`format:check`、`spell` 作为 `//#` Root Task，利用 turbo 缓存加速重复执行
- `//#format` — `cache: false`（始终执行，会修改文件）
- `//#format:check` — 启用缓存
- `//#spell` — 启用缓存

### 7.2 lint 任务添加显式 outputs

- **文件**: `turbo.json`
- **问题**: `lint` 没有显式 `outputs`，与 `spell` 和 `test` 不一致
- **方案**: 添加 `"outputs": []`

---

## 八、Template-App 配置优化

### 8.1 代理目标地址改为环境变量

- **文件**: `apps/template-app/vite.config.ts`、`.env.development`
- **问题**: 代理目标 `http://127.0.0.1:10002` 等硬编码在代码中
- **方案**: 从 `VITE_API_TARGET`/`VITE_WS_TARGET`/`VITE_UE_TARGET` 环境变量读取

### 8.2 UI 包简化 Vite 配置

- **文件**: `packages/ui/vite.config.ts`、`package.json`
- **问题**: UI 库引用了 `vuePluginPreset`（包含 devtools、auto-import、components、icons 等开发工具），但库构建不需要这些
- **方案**: 移除 `vuePluginPreset`，仅使用 `vue()` + `UnoCSS()`

---

## 九、删除 config-spell 子包

### 9.1 配置内联到根目录

- **删除**: `packages/config-spell/` 整个目录
- **修改**: `cspell.config.js` — 内联原 config-spell 的完整配置
- **同步清理**: 根 `package.json` 及各子包的 `@repo/config-spell` 依赖引用

---

## 十、根目录基础设施补齐

- `.oxfmtrc.json` — 添加 `ignorePatterns`，统一 oxfmt 忽略配置
- `.editorconfig` — 统一缩进（2 空格）、字符集（UTF-8）、换行符（lf）
- `.gitattributes` — `* text=auto eol=lf`，统一换行符

---

## 验证结果

| 任务              | 结果     |
| ----------------- | -------- |
| `pnpm build`      | 7/7 成功 |
| `pnpm type-check` | 逐包通过 |
