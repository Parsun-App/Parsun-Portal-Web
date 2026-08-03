# Design: Portal Empty States

## Overview

Create a shared `EmptyStateComponent` and replace the 5 duplicated ad-hoc empty blocks plus close 3 real gaps (profile blank page, dashboard activity table without message, search-vs-nodata distinction).

## Component API

```ts
// src/app/shared/components/empty-state/empty-state.component.ts
export interface EmptyStateConfig {
  icon?: string;          // primeicons class, e.g. 'pi pi-shopping-cart'
  title: string;
  message?: string;
  actionLabel?: string;
  action?: () => void;
}
```

Standalone component with `@Input() config: EmptyStateConfig` (or individual inputs). Default icon `pi pi-inbox`.

## Template (consistent with existing conventions)

```html
<div class="flex flex-col items-center justify-center h-64 text-surface-400 gap-3">
  <div class="w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
    <i [class]="icon()" class="text-3xl text-surface-400"></i>
  </div>
  <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-300">{{ title() }}</h3>
  @if (message()) {
    <p class="text-sm text-surface-500">{{ message() }}</p>
  }
  @if (actionLabel() && action()) {
    <p-button [label]="actionLabel()" (onClick)="action()!" size="small" />
  }
</div>
```

Uses signals via `input()` function (Angular 21), OnPush (zoneless), no `@Input` decorator.

## Page integrations

| Page | Replace | With |
|------|---------|------|
| orders | `@else if (orders().length === 0)` block | `<app-empty-state [config]="ordersEmptyConfig()">` — config computed: if search/filter active → "Sin resultados para tu búsqueda", else "No hay órdenes" |
| invoices | idem | same pattern, "No hay facturas" |
| quotes | idem | "No hay presupuestos" |
| products | idem | "No hay productos" |
| payments | idem | "No hay pagos" |
| dashboard | activity `@for` without `@empty` | add `@empty` with `<app-empty-state>` compact variant |
| profile | missing `@else` when `profile() === null` | add error empty state "No se pudo cargar el perfil" |

## Search-vs-nodata distinction

Each list page has `searchSignal`/`activeFilters` state. Add a computed boolean `hasActiveFilters()`:
- `true` → title "Sin resultados", message "No encontramos resultados para tu búsqueda o filtros actuales."
- `false` → title "No hay {item}s", message "Tus {items} aparecerán aquí cuando los tengas."

## Files

- CREATE `src/app/shared/components/empty-state/empty-state.component.ts`
- CREATE `src/app/shared/components/empty-state/empty-state.component.spec.ts`
- MODIFY `features/dashboard/dashboard-page.component.ts`
- MODIFY `features/orders/orders-page.component.ts`
- MODIFY `features/invoices/invoices-page.component.ts`
- MODIFY `features/quotes/quotes-page.component.ts`
- MODIFY `features/products/products-page.component.ts`
- MODIFY `features/payments/payments-page.component.ts`
- MODIFY `features/profile/profile-page.component.ts`
