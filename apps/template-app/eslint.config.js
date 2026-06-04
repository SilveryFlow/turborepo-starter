import { config as vitestVueConfig } from '@repo/config-eslint/vitest-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import unocss from '@unocss/eslint-config/flat'

/**
 * Vue 应用的 ESLint 配置
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  // 指定文件范围
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,js,ts,mts,tsx,mjs,cjs}'],
  },

  // 应用级忽略规则
  {
    name: 'app/ignores',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/.vitepress/cache/**'],
  },

  unocss,

  // vitest-vue 测试配置
  ...vitestVueConfig,

  // 禁用 oxlint 已覆盖的规则
  ...pluginOxlint.buildFromOxlintConfigFile('../../.oxlintrc.json'),
]
