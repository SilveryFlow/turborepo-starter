import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import type { ViteUserConfig, ConfigEnv } from 'vitest/config'

export interface CreateTestConfigOptions {
  viteConfig?: ViteUserConfig | ((env: ConfigEnv) => ViteUserConfig)
  test?: NonNullable<ViteUserConfig['test']>
}

const sharedTestDefaults: NonNullable<ViteUserConfig['test']> = {
  environment: 'jsdom',
  exclude: [...configDefaults.exclude, 'e2e/**'],
}

export function createTestConfig(options: CreateTestConfigOptions = {}) {
  const testConfig = options.test
    ? mergeConfig(sharedTestDefaults, options.test) as NonNullable<ViteUserConfig['test']>
    : sharedTestDefaults

  return defineConfig(configEnv => {
    const base = typeof options.viteConfig === 'function'
      ? options.viteConfig(configEnv)
      : (options.viteConfig ?? {})
    return mergeConfig(base, { test: testConfig })
  })
}
