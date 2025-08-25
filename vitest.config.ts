import { fileURLToPath } from 'node:url'
import { defineConfig, mergeConfig, configDefaults } from 'vitest/config'
import type { UserConfig as ViteUserConfig } from 'vite'
import base from './vite.config'

export default mergeConfig(
  base as ViteUserConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['src/shared/test/setup.ts'],
      include: ['src/**/*.{spec,test}.ts'],
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url))
    }
  })
)
