import { defineConfig, mergeConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { createAlias, createCssOptions } from '@repo/config-vite'
import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig(() => {
  return mergeConfig(
    defineConfig({
      plugins: [vue(), UnoCSS()],
      resolve: {
        alias: createAlias(import.meta.url),
      },
      css: createCssOptions(),
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
