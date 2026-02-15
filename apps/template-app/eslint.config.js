import { config as vitestVueConfig } from '@repo/eslint-config/vitest-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import autoImport from './.eslintrc-auto-import.json' with { type: 'json' }
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

  {
    languageOptions: {
      globals: {
        ...autoImport?.globals,
      },
    },
  },

  unocss,

  // vitest-vue 测试配置
  ...vitestVueConfig,

  // Oxlint 与 .oxlintrc.json 同源配置
  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
]
