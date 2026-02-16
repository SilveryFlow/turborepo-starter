import { fileURLToPath, URL } from 'node:url'
import type { AliasOptions } from 'vite'

export const createAlias = (basePath: string): AliasOptions => [
  {
    find: '@',
    replacement: fileURLToPath(new URL('./src', basePath)),
  },
]
