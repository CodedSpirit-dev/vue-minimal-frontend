import { defineConfig } from 'cypress'

export default defineConfig({
  video: false,
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:3005',
    supportFile: 'cypress/support/e2e.ts',
    retries: { runMode: 1, openMode: 0 }
  }
})
