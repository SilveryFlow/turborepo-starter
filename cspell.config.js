import { defineConfig } from 'cspell'
import repoConfig from '@repo/config-spell'

export default defineConfig({
  ...repoConfig,
  words: [...(repoConfig.words ?? []), 'autodocs'],
})
