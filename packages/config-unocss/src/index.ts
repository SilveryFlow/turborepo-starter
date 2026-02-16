// uno.config.ts
import {
  defineConfig,
  presetWind4,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  // 1. 预设 (Presets)
  presets: [
    presetWind4(),
    // 启用属性模式：解决 HTML class 冗长问题
    // <div class="m-2 p-1 text-red"> 变成 <div m-2 p-1 text-red>
    presetAttributify(),

    // 图标预设：直接用 class 写图标，如 i-carbon-sun
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],

  // 2. 转换器 (Transformers) - 关键！
  transformers: [
    // 启用 @apply 功能，支持在 SCSS/CSS 文件中使用 UnoCSS 类
    transformerDirectives(),

    // 启用变体组：hover:(bg-red text-white) 简写
    transformerVariantGroup(),
  ],

  // 3. 自定义规则或快捷方式
  shortcuts: {
    'flex-center': 'flex justify-center items-center',
  },

  // 4. theme
  theme: {},
})
