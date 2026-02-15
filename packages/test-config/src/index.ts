import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import type { ViteUserConfig, ConfigEnv } from 'vitest/config'

/**
 * 所有 workspace 共享的 Vitest 默认 test 配置。
 */
export const vitestDefaultTestConfig = {
  environment: 'jsdom',
  exclude: [...configDefaults.exclude, 'e2e/**'],
} satisfies NonNullable<ViteUserConfig['test']>

/**
 * 基于共享默认值构建的基础 Vitest 配置。
 */
export const baseVitestConfig = defineConfig({
  test: vitestDefaultTestConfig,
})

/**
 * 创建 Vitest 配置时的显式参数。
 */
export interface CreateVitestConfigOptions {
  /**
   * 作为基底的 Vite 配置（对象或工厂函数）。
   */
  viteConfig: ViteUserConfig | ((env: ConfigEnv) => ViteUserConfig)

  /**
   * 追加到共享默认值中的 Vitest `test` 字段。
   * 与默认值冲突时，以该字段为准。
   */
  test?: NonNullable<ViteUserConfig['test']>

  /**
   * 用于覆盖基底 `viteConfig` 的额外 Vite 字段。
   * 这里刻意排除了 `test`，以保持测试配置覆盖入口单一且清晰。
   */
  overrides?: Omit<ViteUserConfig, 'test'>
}

/**
 * 按明确优先级生成最终 Vitest 配置：
 * 1) `viteConfig` 基底
 * 2) 共享 test 默认值
 * 3) 用户传入的 `test` 与 `overrides`（最高优先级）
 */
export function createVitestConfig({ viteConfig, test, overrides = {} }: CreateVitestConfigOptions) {
  const mergedTestConfig = test ? mergeConfig(vitestDefaultTestConfig, test) : vitestDefaultTestConfig
  const vitestOverrides = defineConfig({
    ...overrides,
    test: mergedTestConfig,
  })

  return defineConfig(configEnv => {
    const baseConfig = typeof viteConfig === 'function' ? viteConfig(configEnv) : viteConfig

    return mergeConfig(baseConfig, mergeConfig(baseVitestConfig, vitestOverrides))
  })
}
