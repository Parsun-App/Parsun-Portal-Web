import { expect, test } from '@playwright/test';

test.describe('Customer portal authentication entry point', () => {
  test('renders the customer login form', async ({ page }) => {
    await page.goto('/auth/login');

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();
    await expect(page.getByLabel('RIF')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('redirects protected routes to customer login without a session', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();
  });
});
