import { test, expect } from '@playwright/test';

test.describe('🔐 Authentification Admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('devrait afficher la page de connexion', async ({ page }) => {
    await expect(page).toHaveTitle(/CrossPay Africa/);
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible();
  });

  test('devrait afficher le formulaire de connexion', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible();
  });

  test('devrait afficher une erreur avec des identifiants vides', async ({ page }) => {
    await page.getByRole('button', { name: /se connecter/i }).click();
    
    // Vérifier les messages de validation
    await expect(page.getByText(/email est requis/i)).toBeVisible();
  });

  test('devrait afficher une erreur avec un email invalide', async ({ page }) => {
    await page.getByLabel(/email/i).fill('email-invalide');
    await page.getByLabel(/mot de passe/i).fill('password123');
    await page.getByRole('button', { name: /se connecter/i }).click();
    
    await expect(page.getByText(/email invalide/i)).toBeVisible();
  });

  test('devrait rediriger vers le dashboard après connexion réussie', async ({ page }) => {
    // Mock de l'API de connexion
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '1',
            email: 'admin@crosspay.africa',
            firstName: 'Admin',
            lastName: 'User',
          },
          accessToken: 'mock-jwt-token',
        }),
      });
    });

    await page.getByLabel(/email/i).fill('admin@crosspay.africa');
    await page.getByLabel(/mot de passe/i).fill('password123');
    await page.getByRole('button', { name: /se connecter/i }).click();
    
    // Attendre la redirection
    await page.waitForURL('/');
    
    // Vérifier qu'on est sur le dashboard
    await expect(page.getByRole('heading', { name: /tableau de bord/i })).toBeVisible();
  });
});
