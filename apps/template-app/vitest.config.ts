import { fileURLToPath } from 'node:url'
import { createVitestConfig } from '@repo/config-test'
import viteConfig from './vite.config'

export default createVitestConfig({
  viteConfig,
  test: {
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
})
