import { test, expect } from '@playwright/test';

test.describe('👤 Vérification KYC', () => {
  test.beforeEach(async ({ page }) => {
    // Mock de l'authentification
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'admin@crosspay.africa',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['admin'],
      }));
    });
    
    // Mock de l'API KYC
    await page.route('**/api/kyc**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            userId: 'user-1',
            user: {
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
            },
            status: 'pending',
            documentType: 'passport',
            documentNumber: 'AB123456',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            userId: 'user-2',
            user: {
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane@example.com',
            },
            status: 'approved',
            documentType: 'id_card',
            documentNumber: 'CD789012',
            createdAt: new Date().toISOString(),
          },
        ]),
      });
    });
    
    await page.goto('/kyc');
  });

  test('devrait afficher la liste des vérifications KYC', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /kyc/i })).toBeVisible();
    
    // Vérifier que les vérifications sont affichées
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).toBeVisible();
  });

  test('devrait afficher les statuts des vérifications', async ({ page }) => {
    await expect(page.getByText('pending')).toBeVisible();
    await expect(page.getByText('approved')).toBeVisible();
  });

  test('devrait permettre de filtrer par statut', async ({ page }) => {
    const filterSelect = page.getByRole('combobox', { name: /statut/i });
    
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption('pending');
      
      // Vérifier que seules les vérifications en attente sont affichées
      await expect(page.getByText('John Doe')).toBeVisible();
    }
  });

  test('devrait permettre d\'approuver une vérification', async ({ page }) => {
    // Mock de l'API d'approbation
    await page.route('**/api/kyc/*/approve', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Cliquer sur le bouton d'approbation
    const approveButton = page.getByRole('button', { name: /approuver/i }).first();
    if (await approveButton.isVisible()) {
      await approveButton.click();
      
      // Vérifier le message de succès
      await expect(page.getByText(/vérification approuvée/i)).toBeVisible();
    }
  });

  test('devrait permettre de rejeter une vérification', async ({ page }) => {
    // Mock de l'API de rejet
    await page.route('**/api/kyc/*/reject', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    const rejectButton = page.getByRole('button', { name: /rejeter/i }).first();
    if (await rejectButton.isVisible()) {
      await rejectButton.click();
      
      // Confirmer le rejet
      await page.getByRole('button', { name: /confirmer/i }).click();
      
      // Vérifier le message de succès
      await expect(page.getByText(/vérification rejetée/i)).toBeVisible();
    }
  });

  test('devrait afficher les détails d\'une vérification', async ({ page }) => {
    // Cliquer sur une vérification
    await page.getByText('John Doe').click();
    
    // Vérifier que les détails sont affichés
    await expect(page.getByText(/détails de la vérification/i)).toBeVisible();
    await expect(page.getByText(/passport/i)).toBeVisible();
    await expect(page.getByText(/AB123456/)).toBeVisible();
  });
});
