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

  test('logs in and stores the customer session', async ({ page }) => {
    await page.route('**/api/portal/auth/login', async (route) => {
      expect(route.request().method()).toBe('POST');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'portal-e2e-access-token',
          refreshToken: 'portal-e2e-refresh-token',
          expiresIn: 3_600_000,
          customer: {
            id: 'customer-e2e-1',
            legalName: 'Inversiones Global S.A.',
            rif: 'J-12345678-9',
            alias: 'Global',
            priceTypeId: 'price-type-e2e-1',
            paymentType: 'CASH',
          },
        }),
      });
    });
    await page.route('**/api/portal/dashboard', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ recentOrders: [], recentInvoices: [], recentPayments: [] }),
      });
    });

    await page.goto('/auth/login');
    await page.getByLabel('RIF').fill('J-12345678-9');
    await page.locator('#password').fill('CustomerPassword1!');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.evaluate(() => localStorage.getItem('accessToken'))).resolves.toBe(
      'portal-e2e-access-token',
    );
    await expect(page.evaluate(() => JSON.parse(localStorage.getItem('customer') ?? '{}'))).resolves.toMatchObject({
      rif: 'J-12345678-9',
      legalName: 'Inversiones Global S.A.',
    });
  });

  test('shows the API error when portal credentials are rejected', async ({ page }) => {
    await page.route('**/api/portal/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid RIF or password' }),
      });
    });

    await page.goto('/auth/login');
    await page.getByLabel('RIF').fill('J-00000000-0');
    await page.locator('#password').fill('WrongPassword1!');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByText('Invalid RIF or password')).toBeVisible();
    await expect(page.evaluate(() => localStorage.getItem('accessToken'))).resolves.toBeNull();
  });
});
