import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file if present (ignored when vars are already set via CI/shell)
config({ path: resolve(__dirname, '.env'), override: false });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,
  timeout: 90000,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'https://www.testmuai.com/selenium-playground/',
    // Required: capture artifacts on every test run (not just failures/retries)
    video: 'on',
    screenshot: 'on',
    trace: 'on',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
