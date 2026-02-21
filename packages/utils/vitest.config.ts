import { fileURLToPath } from 'node:url'
import { createVitestConfig } from '@repo/config-test'

export default createVitestConfig({
  viteConfig: {},
  test: {
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
})
