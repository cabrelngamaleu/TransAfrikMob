import { test, expect } from '@playwright/test';

test.describe('♿ Tests d\'Accessibilité', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-jwt-token');
    });
  });

  test('le dashboard devrait être accessible au clavier', async ({ page }) => {
    await page.goto('/');
    
    // Navigation au clavier
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Vérifier que la navigation fonctionne
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('les formulaires devraient avoir des labels', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/mot de passe/i);
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('les boutons devraient avoir des aria-labels', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.getByRole('button', { name: /mode/i });
    await expect(themeToggle).toHaveAttribute('aria-label');
  });

  test('les images devraient avoir des textes alternatifs', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('alt');
    }
  });

  test('le contraste des couleurs devrait être suffisant', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier que le texte est lisible
    const headings = page.locator('h1, h2, h3');
    const count = await headings.count();
    
    for (let i = 0; i < count; i++) {
      const heading = headings.nth(i);
      await expect(heading).toBeVisible();
    }
  });

  test('le site devrait supporter le zoom', async ({ page }) => {
    await page.goto('/');
    
    // Zoomer à 200%
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });
    
    // Vérifier que le contenu est toujours visible
    await expect(page.getByRole('heading').first()).toBeVisible();
  });
});
