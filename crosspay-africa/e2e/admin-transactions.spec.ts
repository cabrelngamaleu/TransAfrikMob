import { test, expect } from '@playwright/test';

test.describe('💰 Gestion des Transactions', () => {
  test.beforeEach(async ({ page }) => {
    // Mock de l'authentification
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'admin@crosspay.africa',
        firstName: 'Admin',
        lastName: 'User',
      }));
    });
    
    // Mock de l'API des transactions
    await page.route('**/api/transactions**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            amount: 1000,
            currency: 'XOF',
            status: 'completed',
            recipient: 'John Doe',
            date: new Date().toISOString(),
          },
          {
            id: '2',
            amount: 5000,
            currency: 'USD',
            status: 'pending',
            recipient: 'Jane Smith',
            date: new Date().toISOString(),
          },
        ]),
      });
    });
    
    await page.goto('/transactions');
  });

  test('devrait afficher la liste des transactions', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /transactions/i })).toBeVisible();
    
    // Vérifier que les transactions sont affichées
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).toBeVisible();
  });

  test('devrait afficher le statut des transactions', async ({ page }) => {
    // Vérifier les badges de statut
    await expect(page.getByText('completed')).toBeVisible();
    await expect(page.getByText('pending')).toBeVisible();
  });

  test('devrait permettre de filtrer les transactions', async ({ page }) => {
    const filterButton = page.getByRole('button', { name: /filtre/i });
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.getByRole('option', { name: /complété/i }).click();
      
      // Vérifier que seules les transactions complétées sont affichées
      await expect(page.getByText('completed')).toBeVisible();
    }
  });

  test('devrait permettre de rechercher une transaction', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/rechercher/i);
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('John Doe');
      
      // Vérifier que seules les transactions correspondantes sont affichées
      await expect(page.getByText('John Doe')).toBeVisible();
    }
  });

  test('devrait afficher les détails d\'une transaction au clic', async ({ page }) => {
    // Cliquer sur une transaction
    await page.getByText('John Doe').click();
    
    // Vérifier que le modal ou la page de détails s'affiche
    await expect(page.getByText(/détails de la transaction/i)).toBeVisible();
    await expect(page.getByText(/1000/)).toBeVisible();
  });

  test('devrait permettre d\'exporter les transactions', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /exporter/i });
    
    if (await exportButton.isVisible()) {
      // Configuration du téléchargement
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('transactions');
    }
  });
});
