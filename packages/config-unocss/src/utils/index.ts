import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * 自动发现 monorepo 中使用 UnoCSS 的包，返回其 src/ 扫描路径。
 * 以 uno.config.ts 存在作为"注册标记"，只扫描声明了 UnoCSS 配置的包。
 */
export function discoverUnoSources(): string[] {
  const root = findMonorepoRoot()
  if (!root) return []

  const sources: string[] = []
  const dirs = ['apps', 'packages']

  for (const dir of dirs) {
    const dirPath = resolve(root, dir)
    if (!existsSync(dirPath)) continue

    for (const name of readdirSync(dirPath, { withFileTypes: true })) {
      if (!name.isDirectory()) continue
      const pkgDir = resolve(dirPath, name.name)
      const unoConfig = resolve(pkgDir, 'uno.config.ts')
      if (!existsSync(unoConfig)) continue

      sources.push(
        `${dir}/${name.name}/src/**/*.{vue,js,ts,jsx,tsx,md,mdx}`,
      )
    }
  }

  return sources
}

/** 从 cwd 向上查找 monorepo 根目录（包含 pnpm-workspace.yaml 的目录） */
function findMonorepoRoot(): string | null {
  let dir = process.cwd()
  while (true) {
    if (existsSync(resolve(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = resolve(dir, '..')
    if (parent === dir) return null
    dir = parent
  }
}
