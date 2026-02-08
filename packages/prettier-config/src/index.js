/**
 * @type {import('prettier').Config}
 */
export default {
  printWidth: 120, // 单行长度
  singleQuote: true, // 使用单引号
  semi: false, // 不在语句末尾加分号
  arrowParens: 'avoid', // 箭头函数只有一个参数时省略括号
  quoteProps: 'as-needed', // 对象属性只有在必要时才使用引号
  endOfLine: 'lf', // 换行符
  bracketSpacing: true, // 在对象字面量的括号之间添加空格
  experimentalOperatorPosition: 'end', // 操作符位置
  htmlWhitespaceSensitivity: 'css', // HTML 空格敏感度
  proseWrap: 'preserve', // 保留段落换行
  tabWidth: 2, // 缩进空格数
  useTabs: false, // 使用空格而不是制表符
  trailingComma: 'all', // 保留尾随逗号
}
