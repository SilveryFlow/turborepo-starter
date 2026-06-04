import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import { config as baseConfig } from './base.js'

/**
 * Vue 3 + TypeScript 项目的 ESLint 配置
 */
export const config = defineConfigWithVueTs(
  // 继承基础配置（包含 eslint-config-prettier）
  ...baseConfig,

  // Vue 3 essential 规则（不包含格式化规则，与 oxfmt 不冲突）
  ...pluginVue.configs['flat/essential'],

  // Vue + TypeScript 推荐规则
  vueTsConfigs.recommended,

  // 自定义规则
  {
    name: 'repo/vue/custom',
    files: ['**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'warn',
    },
  },
)
