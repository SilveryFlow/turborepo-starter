import { compression } from 'vite-plugin-compression2'
import viteRestart from 'vite-plugin-restart'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import UnoCSS from 'unocss/vite'
import type { PluginOption } from 'vite'

export interface VitePluginPresetOptions {
  command: 'build' | 'serve'
}

export const vitePluginPreset = (options?: VitePluginPresetOptions): PluginOption[] => {
  const isBuild = options?.command === 'build'

  return [
    isBuild ? compression() : null,
    viteRestart({
      restart: ['.env*', 'vite.config.[jt]s'],
    }),
    ViteImageOptimizer({}),
    UnoCSS(),
  ].filter(Boolean)
}
