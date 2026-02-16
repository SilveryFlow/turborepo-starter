import type { Preview } from '@storybook/vue3-vite'
import 'virtual:uno.css'
import '@repo/ui/style.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
      },
    },
  },
}

export default preview
