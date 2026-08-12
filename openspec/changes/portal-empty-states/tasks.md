# Tasks: Portal Empty States

## Task 1 — Create shared EmptyStateComponent

- [x] Create `src/app/shared/components/empty-state/empty-state.component.ts`
  - Standalone, signals via `input()`, OnPush, `ChangeDetectionStrategy.OnPush`
  - Inputs: `icon` (default `pi pi-inbox`), `title`, `message`, `actionLabel`, `action`
  - Template: circle icon + h3 title + p message + optional action button
- [x] Create `src/app/shared/components/empty-state/empty-state.component.spec.ts`
  - Renders title, message, icon default
  - Optional: action button triggers action
- [x] Wire standalone component (no NgModule needed)

## Task 2 — Replace duplicated empty blocks in list pages

- [x] `orders-page.component.ts`: replace empty block with `<app-empty-state>`; add `hasActiveFilters()` computed (search query OR status filter active) → title "Sin resultados para tu búsqueda" vs "No hay órdenes"
- [x] `invoices-page.component.ts`: same pattern → "No hay facturas"
- [x] `quotes-page.component.ts`: same pattern → "No hay presupuestos"
- [x] `products-page.component.ts`: same pattern → "No hay productos"; also add error toast in catchError
- [x] `payments-page.component.ts`: same pattern → "No hay pagos"

## Task 3 — Dashboard empty activity

- [x] `dashboard-page.component.ts`: add `@empty` to `recentActivity` `@for` → `<app-empty-state>` compact (no h-64, use py-10) "Sin actividad reciente"

## Task 4 — Profile non-blank error state

- [x] `profile-page.component.ts`: add `@else` when `profile() === null` → `<app-empty-state>` error variant "No se pudo cargar el perfil"

## Task 5 — Verify

- [x] `npm run build` passes with zero errors
- [x] `npm test` component tests pass, coverage for new component > 75% (100% achieved)
- [x] Manual: visit /orders, /invoices, /quotes, /products, /payments, /dashboard, /profile with empty + populated data
