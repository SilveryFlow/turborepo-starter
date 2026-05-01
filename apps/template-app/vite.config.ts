import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { defineConfig, loadEnv, mergeConfig } from 'vite'
import {
  vitePluginPreset,
  createAlias,
  createBuildOptions,
  createCssOptions,
  createServeOptions,
} from '@repo/config-vite'

// https://vite.dev/config/
export default defineConfig(configEnv => {
  const { mode, command } = configEnv
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.VITE_PORT) || 5173
  const API_BASE = env.VITE_BASE_API || '/api'
  const WS_BASE = env.VITE_WEBSOCKET_BASE_API || '/ws'
  const UE_BASE = env.VITE_UE_BASE_API || '/ue'
  const API_TARGET = env.VITE_API_TARGET || 'http://127.0.0.1:10002'
  const WS_TARGET = env.VITE_WS_TARGET || 'ws://127.0.0.1:10002'
  const UE_TARGET = env.VITE_UE_TARGET || 'http://127.0.0.1:901'

  return mergeConfig(
    defineConfig({
      plugins: [
        vue(),
        vueDevTools(),
        AutoImport({
          imports: [
            'vue',
            'vue-router',
            'pinia',
            '@vueuse/core',
            { '@vueuse/router': ['useRouteHash', 'useRouteQuery', 'useRouteParams'] },
          ],
          resolvers: [ElementPlusResolver()],
          dts: 'src/types/auto-imports.d.ts',
          eslintrc: {
            enabled: true,
          },
        }),
        Components({
          resolvers: [
            ElementPlusResolver({ importStyle: 'sass' }),
            IconsResolver({
              enabledCollections: ['ep'],
            }),
            (componentName: string) => {
              if (componentName === 'VChart') {
                return { name: 'default', from: 'vue-echarts' }
              }
            },
          ],
          dts: 'src/types/components.d.ts',
        }),
        Icons({ autoInstall: false }),
        ...vitePluginPreset({ command }),
      ],
      resolve: {
        alias: createAlias(import.meta.url),
      },
      build: createBuildOptions(),
      css: createCssOptions(),
      server: createServeOptions(),
    }),
    defineConfig({
      server: {
        port,
        proxy: {
          [API_BASE]: {
            target: API_TARGET,
            changeOrigin: true,
            rewrite: path => path.replace(new RegExp(`^${API_BASE}`), ''),
          },

          [WS_BASE]: {
            target: WS_TARGET,
            changeOrigin: true,
            ws: true,
            rewrite: path => path.replace(new RegExp(`^${WS_BASE}`), ''),
          },

          [UE_BASE]: {
            target: UE_TARGET,
            changeOrigin: true,
            rewrite: path => path.replace(new RegExp(`^${UE_BASE}`), ''),
          },
        },
      },
    }),
    false,
  )
})
