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
