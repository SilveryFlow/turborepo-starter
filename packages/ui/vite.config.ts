import { defineConfig, mergeConfig } from 'vite'
import { resolve } from 'path'
import { vuePluginPreset, createAlias, defaultCssOptions } from '@repo/vite-config'
import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig(() => {
  return mergeConfig(
    defineConfig({
      plugins: [...vuePluginPreset(), UnoCSS()],
      resolve: {
        alias: createAlias(import.meta.url),
      },
      css: defaultCssOptions,
    }),
    defineConfig({
      build: {
        lib: {
          entry: resolve(import.meta.dirname, 'src/index.ts'),
          name: 'RepoUI',
          fileName: 'index',
          formats: ['es'],
        },
        sourcemap: true,
        rollupOptions: {
          // 确保外部化处理那些你不想打包进库的依赖
          external: ['vue', 'unocss', /^element-plus(\/.*)?$/],
          output: {
            preserveModules: true,
          },
        },
        minify: false,
      },
    }),
  )
})
