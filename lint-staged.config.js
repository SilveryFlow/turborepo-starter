/** @type {import('lint-staged').Configuration} */
export default {
  '**/*.{js,ts,vue,jsx,tsx}': ['eslint --fix', 'prettier --write --experimental-cli', 'cspell --no-exit-code'],
  '**/*.{css,scss,html,json}': ['prettier --write --experimental-cli', 'cspell --no-exit-code'],
  '**/*.md': ['prettier --write --experimental-cli'],
}
