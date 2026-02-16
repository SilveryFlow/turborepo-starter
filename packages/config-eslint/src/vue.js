import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
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
)
