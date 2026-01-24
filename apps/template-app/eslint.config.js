import { config as vitestVueConfig } from '@repo/eslint-config/vitest-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import autoImport from './.eslintrc-auto-import.json' assert { type: 'json' }

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

  {
    languageOptions: {
      globals: {
        ...(autoImport?.globals ?? {}),
      },
    },
  },

  // vitest-vue 测试配置
  ...vitestVueConfig,

  // Oxlint 性能优化（可选）
  ...pluginOxlint.configs['flat/recommended'],
]
