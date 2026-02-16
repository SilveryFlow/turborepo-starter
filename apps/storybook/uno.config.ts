import { defineConfig } from 'unocss'
import defaultConfig from '@repo/config-unocss'

export default defineConfig({
  ...defaultConfig,
  content: {
    filesystem: [
      'src/**/*.{vue,js,ts,jsx,tsx,md,mdx}',
      '.storybook/**/*.{vue,js,ts,jsx,tsx,md,mdx}',
      '../../packages/ui/src/**/*.{vue,js,ts,jsx,tsx,md,mdx}',
    ],
  },
})
