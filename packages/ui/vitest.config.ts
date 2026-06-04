import { fileURLToPath } from 'node:url'
import { createTestConfig } from '@repo/config-test'
import viteConfig from './vite.config'

export default createTestConfig({
  viteConfig,
  test: {
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
})
