# Tasks: Portal Module Structure — Screaming Architecture

## Task 1 — Dashboard module structure

- [x] Move `portal-dashboard.interface.ts` → `features/dashboard/models/interfaces/`; create `features/dashboard/models/index.ts` barrel
- [x] Create `features/dashboard/messages/dashboard.messages.ts` (loadError)
- [x] Create `features/dashboard/services/application/dashboard.service.ts` (loading + dashboard signals, load(), toast on error)
- [x] Move page to `features/dashboard/pages/`; refactor to consume `DashboardService`
- [x] Create `features/dashboard/router/dashboard.routes.ts`; wire `loadChildren` in `app.routes.ts`
- [x] Update `dashboard-api.service.ts` import to `@features/dashboard/models`

## Task 2 — Products module structure

- [x] Move `portal-product.interface.ts` → `features/products/models/interfaces/`; create barrel
- [x] Create `features/products/messages/products.messages.ts`
- [x] Create `features/products/services/application/products.service.ts` (loading, products, totalElements, searchTerm, selectedCategory, currentPage, pageSize, categoryOptions, debounce)
- [x] Move page to `features/products/pages/`; refactor to consume `ProductsService`
- [x] Create `features/products/router/products.routes.ts`; wire in `app.routes.ts`
- [x] Update `products-api.service.ts` import to `@features/products/models` (PagedResponse stays shared)

## Task 3 — Quotes module structure

- [x] Move `portal-quote.interface.ts` → `features/quotes/models/interfaces/`; create barrel
- [x] Create `features/quotes/messages/quotes.messages.ts`
- [x] Create `features/quotes/services/application/quotes.service.ts` (loading, quotes, detail, dialog, searchTerm, filterStatus, debounce, openDetail)
- [x] Move page to `features/quotes/pages/`; refactor to consume `QuotesService`
- [x] Create `features/quotes/router/quotes.routes.ts`; wire in `app.routes.ts`
- [x] Update `quotes-api.service.ts` import to `@features/quotes/models`

## Task 4 — Orders module structure

- [x] Move `portal-order.interface.ts` → `features/orders/models/interfaces/`; create barrel
- [x] Create `features/orders/messages/orders.messages.ts`
- [x] Create `features/orders/services/application/orders.service.ts` (loading, orders, detail, dialog, searchTerm, filterStatus, debounce, confirmOrder, cancelOrder)
- [x] Move page to `features/orders/pages/`; refactor to consume `OrdersService` (ConfirmationService stays in page)
- [x] Create `features/orders/router/orders.routes.ts`; wire in `app.routes.ts`
- [x] Update `orders-api.service.ts` import to `@features/orders/models`

## Task 5 — Invoices module structure

- [x] Move `portal-invoice.interface.ts` → `features/invoices/models/interfaces/`; create barrel
- [x] Create `features/invoices/messages/invoices.messages.ts`
- [x] Create `features/invoices/services/application/invoices.service.ts` (loading, invoices, detail, dialog, searchTerm, filterStatus, debounce, openDetail)
- [x] Move page to `features/invoices/pages/`; refactor to consume `InvoicesService`
- [x] Create `features/invoices/router/invoices.routes.ts`; wire in `app.routes.ts`
- [x] Update `invoices-api.service.ts` import to `@features/invoices/models`

## Task 6 — Payments module structure

- [x] Move `portal-payment.interface.ts` → `features/payments/models/interfaces/`; create barrel
- [x] Create `features/payments/messages/payments.messages.ts`
- [x] Create `features/payments/services/application/payments.service.ts` (loading, payments, detail, dialog, searchTerm, debounce, openDetail)
- [x] Move page to `features/payments/pages/`; refactor to consume `PaymentsService`
- [x] Create `features/payments/router/payments.routes.ts`; wire in `app.routes.ts`
- [x] Update `payments-api.service.ts` import to `@features/payments/models`

## Task 7 — Profile module structure

- [x] Move `portal-profile.interface.ts` → `features/profile/models/interfaces/`; create barrel
- [x] Create `features/profile/messages/profile.messages.ts`
- [x] Create `features/profile/services/application/profile.service.ts` (loading, profile, load())
- [x] Move page to `features/profile/pages/`; refactor to consume `ProfileService`
- [x] Create `features/profile/router/profile.routes.ts`; wire in `app.routes.ts`
- [x] Update `profile-api.service.ts` import to `@features/profile/models`

## Task 8 — Shared cleanup + global toast

- [x] Reduce `shared/models/index.ts` to `PagedResponse` only
- [x] Delete legacy `shared/models.ts` flat file
- [x] Add global `p-toast` to `portal-layout.component.html`; remove page-level `providers: [MessageService]` from all pages
- [x] Update `dashboard-page.component.spec.ts` (import path + service mocks)

## Task 9 — Verify

- [x] `ng build` (Docker) passes with zero errors and warnings
- [x] `bun run test:run` all specs pass
- [x] `grep` confirms no feature imports `@shared/models` for `portal-*` types
- [ ] Manual: visit each feature route, confirm data loads and toasts render globally
