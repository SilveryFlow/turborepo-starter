import type { CSSOptions } from 'vite'

export const defaultCssOptions: CSSOptions = {
  devSourcemap: true,
  preprocessorOptions: {
    scss: {
      // 自动注入全局样式变量（如需要可启用）
      additionalData: '@use "@/assets/styles/scss-variables.scss" as *;',
    },
  },
}
