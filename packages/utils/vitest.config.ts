import { fileURLToPath } from 'node:url'
import { createTestConfig } from '@repo/config-test'

export default createTestConfig({
  test: {
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
})
