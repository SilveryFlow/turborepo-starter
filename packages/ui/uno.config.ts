import { defineConfig } from 'unocss'
import defaultConfig from '@repo/unocss-config'

export default defineConfig({
  presets: [...(defaultConfig.presets ?? [])],
  transformers: [...(defaultConfig.transformers ?? [])],
  shortcuts: {
    ...defaultConfig.shortcuts,
  },
})
