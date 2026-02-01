import { fileURLToPath } from 'node:url'
import { defineVitestConfig } from '@repo/test-config'
import viteConfig from './vite.config'

export default defineVitestConfig(viteConfig, {
  test: {
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
})
