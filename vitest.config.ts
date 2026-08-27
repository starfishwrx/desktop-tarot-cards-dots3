import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['worker/**/*.test.ts', 'src/renderer/src/**/*.test.ts'],
    environment: 'node'
  }
})
