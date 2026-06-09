import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file if present (ignored when vars are already set via CI/shell)
config({ path: resolve(__dirname, '.env'), override: false });

export default defineConfig({
  testDir: './tests',
  // Run tests sequentially — LambdaTest free/trial allows 1 concurrent session.
  // Increase workers if your plan supports more parallel sessions.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  timeout: 120000,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'https://www.testmuai.com/selenium-playground/',
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
