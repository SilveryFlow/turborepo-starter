import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import type { PluginOption } from 'vite'

export const VChartResolver = (componentName: string) => {
  if (componentName === 'VChart') {
    return {
      name: 'default',
      from: 'vue-echarts',
    }
  }
}

export const vuePluginPreset = (): PluginOption[] => [
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
      VChartResolver,
    ],
    dts: 'src/types/components.d.ts',
  }),
  Icons({
    autoInstall: true,
  }),
]
