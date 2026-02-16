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
