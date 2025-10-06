import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour les tests E2E de CrossPay Africa
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  
  /* Durée maximale d'un test */
  timeout: 30 * 1000,
  
  /* Exécuter les tests en parallèle */
  fullyParallel: true,
  
  /* Échouer le build en CI si des tests sont marqués test.only */
  forbidOnly: !!process.env.CI,
  
  /* Nombre de tentatives en cas d'échec en CI */
  retries: process.env.CI ? 2 : 0,
  
  /* Nombre de workers en parallèle */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  
  /* Configuration partagée pour tous les projets */
  use: {
    /* URL de base pour la navigation */
    baseURL: 'http://localhost:4000',
    
    /* Collecter les traces en cas d'échec */
    trace: 'on-first-retry',
    
    /* Screenshots */
    screenshot: 'only-on-failure',
    
    /* Vidéos */
    video: 'retain-on-failure',
  },

  /* Configuration des projets de test */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Tests sur mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Tests sur tablettes */
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],

  /* Serveur de développement pour les tests */
  webServer: {
    command: 'cd apps/admin && npm run dev',
    url: 'http://localhost:4000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
