/** @type {import('lint-staged').Configuration} */
export default {
  '**/*.{js,ts,vue,jsx,tsx}': [
    'eslint --fix --cache',
    'oxfmt --ignore-path .oxfmtignore --no-error-on-unmatched-pattern',
    'cspell --no-exit-code --no-must-find-files --cache',
  ],
  '**/*.{css,scss,html,json}': [
    'oxfmt --ignore-path .oxfmtignore --no-error-on-unmatched-pattern',
    'cspell --no-exit-code --no-must-find-files --cache',
  ],
  '**/*.md': ['oxfmt --ignore-path .oxfmtignore --no-error-on-unmatched-pattern'],
}
