import { expect, test, type Page, type Route } from '@playwright/test';

const portalRoutes = [
  '/dashboard',
  '/products',
  '/quotes',
  '/orders',
  '/invoices',
  '/payments',
  '/profile',
] as const;

const emptyList = [];

async function authenticate(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'portal-e2e-access-token');
    localStorage.setItem('refreshToken', 'portal-e2e-refresh-token');
    localStorage.setItem(
      'customer',
      JSON.stringify({
        id: 'customer-e2e-1',
        legalName: 'Inversiones Global S.A.',
        rif: 'J-12345678-9',
        alias: 'Global',
        type: 'JURIDICAL',
        paymentType: 'CASH',
      }),
    );
  });
}

async function fulfillApi(route: Route): Promise<void> {
  const path = new URL(route.request().url()).pathname;

  if (path.endsWith('/notifications/unread-count')) {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"count":0}' });
    return;
  }

  if (path.endsWith('/dashboard')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        draftQuotes: 0,
        confirmedOrders: 0,
        pendingInvoices: 0,
        pendingAmount: 0,
        recentActivity: [],
      }),
    });
    return;
  }

  if (path.endsWith('/invoices/summary')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        totalDebt: 0,
        pendingCount: 0,
        paidThisMonth: 0,
        pendingApprovalAmount: 0,
      }),
    });
    return;
  }

  if (path.endsWith('/profile')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'customer-e2e-1',
        legalName: 'Inversiones Global S.A.',
        rif: 'J-12345678-9',
        alias: 'Global',
        type: 'JURIDICAL',
        paymentType: 'CASH',
        creditDays: 0,
        creditLimit: 0,
        currentBalance: 0,
        emails: [],
        phones: [],
        addresses: [],
      }),
    });
    return;
  }

  if (path.endsWith('/catalog/pdf')) {
    await route.fulfill({ status: 200, contentType: 'application/pdf', body: 'e2e-catalog' });
    return;
  }

  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(emptyList) });
}

for (const route of portalRoutes) {
  test(`loads ${route} and reaches its customer portal shell`, async ({ page }) => {
    const apiRequests: string[] = [];
    await authenticate(page);
    await page.route('**/api/**', async (request) => {
      apiRequests.push(new URL(request.request().url()).pathname);
      await fulfillApi(request);
    });

    await page.goto(route);

    await expect(page).toHaveURL(new RegExp(`${route.replaceAll('/', '\\/')}$`));
    await expect(page.locator('app-portal-layout').first()).toBeVisible();
    await expect.poll(() => apiRequests.length).toBeGreaterThan(0);
  });
}
