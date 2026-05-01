import type { BuildOptions } from 'vite'

export interface AdvancedChunkGroup {
  name: string
  test: RegExp
  priority: number
}

export interface CreateBuildOptions {
  chunkGroups?: AdvancedChunkGroup[]
}

const defaultChunkGroups: AdvancedChunkGroup[] = [
  { name: 'framework', test: /\/node_modules\/(vue|@vue\/|vue-router|pinia)\//, priority: 20 },
  { name: 'element-plus', test: /\/node_modules\/element-plus\//, priority: 15 },
  { name: 'vendor', test: /\/node_modules\//, priority: 10 },
]

const assetFileNames = (assetInfo: { names?: string[] }) => {
  const name = assetInfo?.names?.[0] ?? ''
  if (!name) return 'assets/[name]-[hash][extname]'
  if (name.endsWith('.css')) return 'css/[name]-[hash][extname]'
  if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) return 'images/[name]-[hash][extname]'
  if (/\.(woff2?|eot|ttf|otf)$/.test(name)) return 'fonts/[name]-[hash][extname]'
  return 'assets/[name]-[hash][extname]'
}

export const createBuildOptions = (options?: CreateBuildOptions): BuildOptions => ({
  rolldownOptions: {
    output: {
      chunkFileNames: 'js/[name]-[hash].js',
      entryFileNames: 'js/[name]-[hash].js',
      assetFileNames,
      advancedChunks: {
        groups: options?.chunkGroups ?? defaultChunkGroups,
      },
    },
  },
})

/** @deprecated Use createBuildOptions() instead */
export const defaultBuildOptions: BuildOptions = createBuildOptions()
