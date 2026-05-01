import type { CSSOptions } from 'vite'

export interface CreateCssOptions {
  scssVariablesPath?: string | false
}

export const createCssOptions = (options?: CreateCssOptions): CSSOptions => {
  const scssPath = options?.scssVariablesPath
  const additionalData =
    scssPath === false ? '' : `@use "${scssPath ?? '@/assets/styles/scss-variables.scss'}" as *;`

  return {
    devSourcemap: true,
    preprocessorOptions: {
      scss: additionalData
        ? {
            additionalData,
          }
        : undefined,
    },
  }
}

/** @deprecated Use createCssOptions() instead */
export const defaultCssOptions: CSSOptions = createCssOptions()
