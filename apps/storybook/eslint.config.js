import { config as vueConfig } from '@repo/eslint-config/vue'

export default [
  {
    name: 'storybook/files-to-lint',
    files: ['**/*.{vue,js,ts,mts,tsx,mjs,cjs,mdx}'],
  },
  {
    name: 'storybook/ignores',
    ignores: ['**/dist/**', '**/coverage/**'],
  },
  ...vueConfig,
]
