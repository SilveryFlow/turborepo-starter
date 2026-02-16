import type { BuildOptions } from 'vite'

export const defaultBuildOptions: BuildOptions = {
  rollupOptions: {
    output: {
      // 静态资源分类打包
      chunkFileNames: 'js/[name]-[hash].js',
      entryFileNames: 'js/[name]-[hash].js',

      assetFileNames: assetInfo => {
        const name = assetInfo?.names?.[0] ?? ''
        if (!name) return 'assets/[name]-[hash][extname]'

        // 根据文件类型分类存放
        if (name.endsWith('.css')) {
          return 'css/[name]-[hash][extname]'
        }
        if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) {
          return 'images/[name]-[hash][extname]'
        }
        if (/\.(woff2?|eot|ttf|otf)$/.test(name)) {
          return 'fonts/[name]-[hash][extname]'
        }
        return 'assets/[name]-[hash][extname]'
      },
    },
  },
}
