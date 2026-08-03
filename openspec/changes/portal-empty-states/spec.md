# SDD Change: Portal Empty States

## Requirement

When a portal page has no data to display — empty list, no search results, empty dashboard activity, or failed load — the UI must render a consistent, designed empty state instead of an empty table, blank page, or bare header.

## Scenarios

### Scenario: Empty orders list
- **Given** the customer has no orders
- **When** the orders page loads
- **Then** a designed empty state is shown with icon, title "No hay órdenes" and supporting message

### Scenario: Orders search with no results
- **Given** the customer has orders but the search/filter matches none
- **When** the search term or status filter yields zero results
- **Then** an empty state variant "Sin resultados para tu búsqueda" is shown, distinguishable from the no-data state

### Scenario: Empty invoices list
- **Given** the customer has no invoices
- **When** the invoices page loads
- **Then** a designed empty state is shown with invoice icon and title "No hay facturas"

### Scenario: Empty quotes list
- **Given** the customer has no quotes
- **When** the quotes page loads
- **Then** a designed empty state is shown with quote icon and title "No hay presupuestos"

### Scenario: Empty products catalog
- **Given** the catalog has no products or the search matches none
- **When** the products page loads
- **Then** a designed empty state is shown with box icon and title "No hay productos"

### Scenario: Empty payments list
- **Given** the customer has no payments or the search matches none
- **When** the payments page loads
- **Then** a designed empty state is shown with credit card icon and title "No hay pagos"

### Scenario: Dashboard with no recent activity
- **Given** the dashboard loads successfully but recentActivity is empty
- **When** the dashboard renders the activity table
- **Then** the activity section shows a designed empty state instead of a table with only headers

### Scenario: Dashboard all counters zero
- **Given** all dashboard counters are zero
- **When** the dashboard renders
- **Then** counters still show 0 values and the activity section shows its empty state

### Scenario: Profile fails to load
- **Given** the profile request fails or returns null
- **When** the profile page renders
- **Then** a designed error empty state is shown instead of a blank page

### Scenario: Profile with missing sections
- **Given** the profile loads but has no emails, phones, or addresses
- **When** the profile page renders those sections
- **Then** each section shows a subtle "No registrados" placeholder (existing @empty behavior preserved)

### Scenario: Consistent visual language
- **Given** any empty state in the portal
- **When** it renders
- **Then** it uses the shared `app-empty-state` component with consistent styling (icon, title, message, optional action button)

## Acceptance Criteria

1. A shared `app-empty-state` component exists in `shared/components/empty-state/`
2. All 5 duplicated empty-state blocks (orders, invoices, quotes, products, payments) are replaced by the shared component
3. The dashboard activity table has an `@empty` fallback
4. The profile page has a non-blank state when `profile` is null
5. Search/filter empty results are visually distinguishable from "no data at all"
6. Existing loading states, toasts, and PrimeNG table behavior are preserved
