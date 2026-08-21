# Portal Dashboard

Route: `/dashboard`.

`DashboardApiService` calls `/api/portal/dashboard` and the application service exposes customer-scoped invoice, order, payment, and balance summaries. The page is display-only and redirects unauthenticated users through the portal guard.
