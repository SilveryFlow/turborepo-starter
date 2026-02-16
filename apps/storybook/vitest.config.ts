import { join } from 'node:path'
import { mergeConfig, defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import viteConfig from './vite.config'

const configDir = join(import.meta.dirname, '.storybook')
const configDirId = configDir.replaceAll('\\', '/')

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir,
              storybookScript: 'pnpm storybook --ci',
            }),
          ],
          test: {
            name: `storybook:${configDirId}`,
            browser: {
              enabled: true,
              provider: playwright(),
              headless: true,
              instances: [{ browser: 'chromium' }],
            },
            setupFiles: ['./.storybook/vitest.setup.ts'],
          },
        },
      ],
    },
  }),
)
