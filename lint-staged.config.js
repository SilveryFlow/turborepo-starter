/** @type {import('lint-staged').Configuration} */
export default {
  '**/*.{js,ts,vue,jsx,tsx}': [
    'oxlint --fix',
    'eslint --fix --cache',
    'oxfmt --no-error-on-unmatched-pattern',
    'cspell --no-exit-code --no-must-find-files --cache',
  ],
  '**/*.{css,scss,html,json}': [
    'oxfmt --no-error-on-unmatched-pattern',
    'cspell --no-exit-code --no-must-find-files --cache',
  ],
  '**/*.md': ['oxfmt --no-error-on-unmatched-pattern'],
}
