import { test, expect } from '@playwright/test';

test.describe('📊 Dashboard Admin', () => {
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
    
    await page.goto('/');
  });

  test('devrait afficher le dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /tableau de bord/i })).toBeVisible();
  });

  test('devrait afficher les cartes statistiques', async ({ page }) => {
    // Mock de l'API des statistiques
    await page.route('**/api/dashboard/stats', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalRevenue: 1250000,
          activeUsers: 12450,
          transactions: 8750,
          successRate: 98.5,
        }),
      });
    });

    await page.reload();

    // Vérifier que les statistiques sont affichées
    await expect(page.getByText(/revenu total/i)).toBeVisible();
    await expect(page.getByText(/utilisateurs actifs/i)).toBeVisible();
    await expect(page.getByText(/transactions/i)).toBeVisible();
  });

  test('devrait permettre la navigation vers les transactions', async ({ page }) => {
    await page.getByRole('link', { name: /transactions/i }).click();
    await expect(page).toHaveURL('/transactions');
  });

  test('devrait permettre la navigation vers les paramètres', async ({ page }) => {
    await page.getByRole('link', { name: /paramètres/i }).click();
    await expect(page).toHaveURL('/settings');
  });

  test('devrait afficher le toggle de thème', async ({ page }) => {
    const themeToggle = page.getByRole('button', { name: /mode/i });
    await expect(themeToggle).toBeVisible();
    
    // Cliquer sur le toggle
    await themeToggle.click();
    
    // Vérifier que le thème a changé (vérifier la classe dark sur le body ou html)
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('class', /dark/);
  });

  test('devrait permettre de se déconnecter', async ({ page }) => {
    await page.getByRole('button', { name: /déconnexion/i }).click();
    
    // Vérifier la redirection vers login
    await expect(page).toHaveURL('/login');
    
    // Vérifier que le token a été supprimé
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});
