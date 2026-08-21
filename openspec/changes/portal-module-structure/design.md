# Design: Portal Module Structure — Screaming Architecture

## Overview

Reorganize each portal feature module so it is self-contained, mirroring the `auth` module. The root becomes a thin aggregator, feature pages become presentation-only, and all state/messages move into per-feature application services.

## Target structure (applies to every feature: dashboard, products, quotes, orders, invoices, payments, profile)

```
features/<module>/
├── models/
│   ├── index.ts                                    # barrel re-exporting module interfaces
│   └── interfaces/portal-<module>.interface.ts     # moved from shared/models/interfaces/
├── messages/
│   └── <module>.messages.ts                        # success/error message constants
├── pages/
│   ├── <module>-page.component.ts                  # presentation only (consumes application service)
│   ├── <module>-page.component.html
│   └── <module>-page.component.spec.ts             # kept with the page
├── router/
│   └── <module>.routes.ts                          # lazy routes for the feature
└── services/
    ├── api/<module>-api.service.ts                 # HTTP layer (unchanged behavior)
    └── application/<module>.service.ts             # signals + state + messages (new)
```

## Application service pattern (mirrors AuthService)

Each application service is `@Injectable({ providedIn: 'root' })`, injects its api service + `MessageService`, and owns:

- State signals: `loading`, list, `detail`, filter signals (`searchTerm`, `filterStatus`), pagination (products)
- Derived computeds: `activeFilterCount`, `hasActiveFilters` (remain in the page as presentation concern) — decision: computeds that are pure view state stay in the component; state-changing logic moves to the service
- Methods that orchestrate api calls, set signals, and emit toasts using local message constants
- Debounce timers (`scheduleLoad`) move into the service

### Example — QuotesService

```ts
@Injectable({ providedIn: 'root' })
export class QuotesService {
  private readonly api = inject(QuotesApiService);
  private readonly messageService = inject(MessageService);
  private loadTimer: ReturnType<typeof setTimeout> | null = null;

  readonly loading = signal(false);
  readonly quotes = signal<PortalQuoteList[]>([]);
  readonly detail = signal<PortalQuoteDetail | null>(null);
  readonly detailDialogVisible = signal(false);
  readonly searchTerm = signal('');
  readonly filterStatus = signal<string | undefined>(undefined);

  load(): void {
    /* sets loading, calls api.list, fills quotes, toasts on error via QUOTES_MESSAGES */
  }
  onSearch(value: string): void {
    /* set term + debounce 300ms */
  }
  onStatusFilterChange(value: string | null): void {
    /* set + load */
  }
  clearFilters(): void {
    /* reset + load */
  }
  openDetail(id: string): void {
    /* api.getById, sets detail + dialog, toasts on error */
  }
  closeDetail(): void {
    /* clears detail + dialog */
  }
}
```

## Messages pattern

Per-feature constants file:

```ts
export const QUOTES_MESSAGES = {
  loadError: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'No se pudieron cargar los presupuestos',
  },
  detailError: {
    severity: 'error' as const,
    summary: 'Error',
    detail: 'No se pudo cargar el detalle del presupuesto',
  },
};
```

Each api operation that currently shows a toast gets a named constant. Component templates keep `p-toast`; the `MessageService` used by application services must be the one visible to the page toast.

**Decision**: keep `MessageService` provided at the page level (`providers: [MessageService]` on the page component) and have the application service inject the same instance. Angular's hierarchical DI resolves the page-provided instance when the service is injected inside the component tree — application services are `providedIn: 'root'` which would resolve the root instance instead. To guarantee the toast matches the page's `p-toast`:

- Option A (chosen): move `p-toast` to `PortalLayoutComponent` once, remove page-level `providers: [MessageService]`, keep `MessageService` in `app.config` (already present). One global toast for the portal — simpler, consistent with a shared app shell.
- Option B: pass `MessageService` into service methods from the page. More plumbing, keeps per-page toasts.

Go with **Option A** — aligns with the "screaming" shell and removes duplicated toast wiring.

## Router refactor

`app.routes.ts` becomes:

```ts
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/router/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    loadComponent: () =>
      import('./core/layouts/portal-layout.component').then((m) => m.PortalLayoutComponent),
    canActivate: [() => import('./features/auth/guards/auth.guard').then((m) => m.authGuard)],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/router/dashboard.routes').then((m) => m.dashboardRoutes),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/router/products.routes').then((m) => m.productsRoutes),
      },
      // ... quotes, orders, invoices, payments, profile
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
```

Each feature routes file:

```ts
import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [{ path: '', component: DashboardPageComponent }];
```

`DashboardPageComponent` path import becomes `../pages/dashboard-page.component`.

## Models move

| Source (shared/models/interfaces/) | Destination                                                      |
| ---------------------------------- | ---------------------------------------------------------------- |
| `portal-dashboard.interface.ts`    | `features/dashboard/models/interfaces/`                          |
| `portal-product.interface.ts`      | `features/products/models/interfaces/`                           |
| `portal-quote.interface.ts`        | `features/quotes/models/interfaces/`                             |
| `portal-order.interface.ts`        | `features/orders/models/interfaces/`                             |
| `portal-invoice.interface.ts`      | `features/invoices/models/interfaces/`                           |
| `portal-payment.interface.ts`      | `features/payments/models/interfaces/`                           |
| `portal-profile.interface.ts`      | `features/profile/models/interfaces/`                            |
| `paged-response.interface.ts`      | **stays** in `shared/models/interfaces/` (generic cross-cutting) |

`shared/models/index.ts` is reduced to re-export `PagedResponse` only.
`shared/models.ts` (legacy flat file) is **deleted** — it duplicates interfaces and is unused (all imports resolve to `shared/models/` barrel).

## Guards & interceptors

- `authGuard` stays in `features/auth/guards/` — global, referenced by `app.routes.ts`
- `authInterceptor` stays in `features/auth/interceptors/` — global, referenced by `app.config.ts`
- No per-feature guard/interceptor folders are created empty (YAGNI). If a feature later needs one, it is added then.

## Per-feature service responsibilities

| Feature   | Application service | Signals owned                                                                                                                |
| --------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| dashboard | `DashboardService`  | loading, dashboard                                                                                                           |
| products  | `ProductsService`   | loading, products, totalElements, searchTerm, selectedCategory, currentPage, pageSize, categoryOptions (+ debounce)          |
| quotes    | `QuotesService`     | loading, quotes, detail, detailDialogVisible, searchTerm, filterStatus (+ debounce)                                          |
| orders    | `OrdersService`     | loading, orders, detail, detailDialogVisible, searchTerm, filterStatus (+ debounce, confirm/cancel with ConfirmationService) |
| invoices  | `InvoicesService`   | loading, invoices, detail, detailDialogVisible, searchTerm, filterStatus (+ debounce)                                        |
| payments  | `PaymentsService`   | loading, payments, detail, detailDialogVisible, searchTerm (+ debounce)                                                      |
| profile   | `ProfileService`    | loading, profile                                                                                                             |

Confirmation dialogs (`ConfirmationService`) stay in the page component for `orders` (UI concern) — the service exposes `confirm(id)` / `cancel(id)` api calls, the page composes the `confirm()` dialog and calls them. **Decision**: keep `confirmOrder`/`cancelOrder` orchestration in the service but return a simple API; page owns the PrimeNG confirmation dialog wiring. Simpler: service exposes `confirmOrder(id)` and `cancelOrder(id)` methods that do the api call + toast; page keeps the `confirm()` dialog UI and invokes service methods in the accept callback.

## Files summary

- CREATE: 7 application services, 7 router files, 7 messages files, 7 model barrels (+ move 7 interface files)
- MOVE: 7 page components (+ html + specs) into `pages/`
- MODIFY: 7 api services (import paths), 7 page components (consume services), `app.routes.ts`, `shared/models/index.ts`, `portal-layout.component.html` (add global `p-toast`)
- DELETE: `shared/models.ts`, 7 interface files from shared (moved), feature-level `providers: [MessageService]`
