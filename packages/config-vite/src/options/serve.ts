import type { ServerOptions } from 'vite'

export interface CreateServeOptions {
  warmupFiles?: string[]
}

export const createServeOptions = (options?: CreateServeOptions): ServerOptions => ({
  host: '0.0.0.0',
  open: true,
  warmup: {
    clientFiles: options?.warmupFiles ?? [
      './src/main.ts',
      './src/App.vue',
      './src/router/index.ts',
    ],
  },
})

/** @deprecated Use createServeOptions() instead */
export const defaultServeOptions: ServerOptions = createServeOptions()
