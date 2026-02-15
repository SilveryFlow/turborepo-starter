import { fileURLToPath } from 'node:url'
import { createVitestConfig } from '@repo/test-config'
import viteConfig from './vite.config'

export default createVitestConfig({
  viteConfig,
  test: {
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
})
