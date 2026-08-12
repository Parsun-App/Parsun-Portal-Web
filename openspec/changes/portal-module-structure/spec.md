# SDD Change: Portal Module Structure — Screaming Architecture

## Requirement

Every portal feature module (dashboard, products, quotes, orders, invoices, payments, profile) must be self-contained under `features/<module>/` with its own models, router, api service, application service, and messages — mirroring the existing `auth` module structure. Shared cross-cutting types (`PagedResponse`, `status-labels`) stay in `shared`. The root `app.routes.ts` becomes a thin aggregator delegating to each module's router. Feature components become presentation-only consumers of their module's application service (state + signals), no longer orchestrating HTTP directly.

## Scenarios

### Scenario: Dashboard module structure

- **Given** the dashboard feature
- **When** inspecting `features/dashboard/`
- **Then** it contains `models/`, `messages/`, `pages/`, `router/`, and `services/{api,application}/`

### Scenario: Feature models are local

- **Given** any feature module (e.g. `products`)
- **When** inspecting its `models/` directory
- **Then** its domain interfaces (e.g. `PortalProduct`) live in `features/products/models/`, not in `shared/models`

### Scenario: Feature router is lazy-loaded

- **Given** the root `app.routes.ts`
- **When** navigating to a feature route (e.g. `/products`)
- **Then** the route is declared in the module's own `router/*.routes.ts` and loaded via `loadChildren`, keeping the root file as an aggregator

### Scenario: Application service holds state

- **Given** any feature module (e.g. `quotes`)
- **When** the module's page component loads
- **Then** it consumes `QuotesService` (application layer) which owns loading, list, detail, filters, and error signals — the component does not call the api service directly

### Scenario: Feature messages are local

- **Given** any feature module (e.g. `payments`)
- **When** the module shows a success or error toast
- **Then** the message constants (titles/details) come from the module's `messages/` directory

### Scenario: Global auth guard and interceptor remain global

- **Given** the portal route tree and HTTP client
- **When** any protected route is visited or any API call is made
- **Then** `authGuard` (routes) and `authInterceptor` (HTTP) continue to be provided once, globally, from `features/auth/` — not duplicated per module

### Scenario: Shared generic types remain shared

- **Given** the `shared/models` barrel
- **When** inspecting it after the refactor
- **Then** it exposes only cross-cutting generic types (`PagedResponse`) and no feature-specific `portal-*` interfaces

### Scenario: Existing behavior is preserved

- **Given** the refactored portal
- **When** all automated tests run and the app is built
- **Then** every existing spec passes and the production build completes without errors or warnings

## Acceptance Criteria

1. `features/{dashboard,products,quotes,orders,invoices,payments,profile}/` each contain `models/`, `messages/`, `pages/`, `router/`, `services/api/`, `services/application/`
2. All `portal-*` interfaces move from `shared/models/interfaces/` to their owning feature module; `PagedResponse` remains in `shared/models`
3. `app.routes.ts` delegates feature routes via `loadChildren` to each module's `router/*.routes.ts`
4. Each feature has an application service (signal-based state) consumed by its page component
5. Feature message constants live under each module's `messages/`
6. `authGuard` and `authInterceptor` stay global and are not duplicated
7. All existing specs pass; `ng build` succeeds with zero errors and zero warnings
