import { defineConfig, devices } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
const IS_CI = !!process.env.CI

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 2 : undefined,
  reporter: IS_CI
    ? [['github'], ['html', { outputFolder: 'playwright-report', open: 'never' }], ['json', { outputFile: 'playwright-results.json' }]]
    : [['html', { outputFolder: 'playwright-report', open: 'on-failure' }], ['list']],
  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    ignoreHTTPSErrors: true,
  },
  webServer: IS_CI ? undefined : { command: 'npm run dev', url: BASE_URL, reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: 'setup', testMatch: '**/auth.setup.ts' },
    { name: 'chromium', use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user-a.json' }, dependencies: ['setup'] },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], storageState: 'e2e/.auth/user-a.json' }, dependencies: ['setup'] },
    { name: 'webkit', use: { ...devices['Desktop Safari'], storageState: 'e2e/.auth/user-a.json' }, dependencies: ['setup'] },
    { name: 'iphone-14', use: { ...devices['iPhone 14'], storageState: 'e2e/.auth/user-a.json' }, dependencies: ['setup'] },
    { name: 'pixel-7', use: { ...devices['Pixel 7'], storageState: 'e2e/.auth/user-a.json' }, dependencies: ['setup'] },
    { name: 'security', testMatch: '**/security/**/*.spec.ts', use: { ...devices['Desktop Chrome'] } },
  ],
  outputDir: 'playwright-artifacts',
})
