import { defineConfig, loadEnv, mergeConfig } from 'vite'
import {
  vuePluginPreset,
  vitePluginPreset,
  createAlias,
  defaultBuildOptions,
  defaultCssOptions,
  defaultServeOptions,
} from '@repo/vite-config'

// https://vite.dev/config/
export default defineConfig(configEnv => {
  const { mode } = configEnv
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.VITE_PORT) || 5173
  const API_BASE = env.VITE_BASE_API || '/api'
  const WS_BASE = env.VITE_WEBSOCKET_BASE_API || '/ws'
  const UE_BASE = env.VITE_UE_BASE_API || '/ue'

  return mergeConfig(
    defineConfig({
      plugins: [...vuePluginPreset(), ...vitePluginPreset()],
      resolve: {
        alias: createAlias(import.meta.url),
      },
      build: defaultBuildOptions,
      css: defaultCssOptions,
      server: defaultServeOptions,
    }),
    defineConfig({
      server: {
        port,
        proxy: {
          // HTTP API 代理
          [API_BASE]: {
            target: 'http://127.0.0.1:10002', // 后端接口地址
            changeOrigin: true,
            rewrite: path => path.replace(new RegExp(`^${API_BASE}`), ''),
          },

          // WebSocket 代理
          [WS_BASE]: {
            target: 'ws://127.0.0.1:10002', // WebSocket 地址
            changeOrigin: true,
            ws: true, // 开启 websocket 代理
            rewrite: path => path.replace(new RegExp(`^${WS_BASE}`), ''),
          },

          // UE
          [UE_BASE]: {
            target: 'http://127.0.0.1:901', // UE 地址
            changeOrigin: true,
            rewrite: path => path.replace(new RegExp(`^${UE_BASE}`), ''),
          },
        },
      },
    }),
    false,
  )
})
