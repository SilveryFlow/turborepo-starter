import js from '@eslint/js'
import skipFormatting from 'eslint-config-prettier/flat'
import turboPlugin from 'eslint-plugin-turbo'
import tseslint from 'typescript-eslint'
import onlyWarn from 'eslint-plugin-only-warn'
import globals from 'globals'

/**
 * 共享 ESLint 配置
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  //JS规则
  js.configs.recommended,
  //TS规则
  ...tseslint.configs.recommended,

  // 关闭与格式化工具冲突的规则
  skipFormatting,

  //定义全局变量
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  //Turbo规则
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },

  //将error转换为warn
  {
    plugins: {
      onlyWarn,
    },
  },
  //忽略文件
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.d.ts'],
  },
]
