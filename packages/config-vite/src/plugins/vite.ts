import { compression } from 'vite-plugin-compression2'
import viteRestart from 'vite-plugin-restart'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import UnoCSS from 'unocss/vite'
import type { PluginOption } from 'vite'
import Font from 'vite-plugin-font'

export const vitePluginPreset = (): PluginOption[] => [
  compression(),
  viteRestart({
    restart: ['.env*', 'vite.config.[jt]s', 'src/config/**/*', 'scripts/vite/**/*'],
  }),
  ViteImageOptimizer({}),
  UnoCSS(),
  Font.vite({
    include: [/\.otf/, /\.ttf/, /\.woff/, /\.woff2/],
  }),
]
