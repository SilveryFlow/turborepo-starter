import type { ServerOptions } from 'vite'

export const defaultServeOptions: ServerOptions = {
  host: '0.0.0.0', // 局域网访问
  open: true,
  // 预热常用文件，提升首屏加载速度
  warmup: {
    clientFiles: ['./src/main.ts', './src/App.vue', './src/router/index.ts'],
  },
}
