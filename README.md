# Parsun Portal Web

Parsun Portal Web is the private customer-facing Angular application for Parsun. It gives authenticated customers access to their dashboard, products, quotes, orders, invoices, payments, and profile data. The repository exists to isolate the external customer experience from the internal back-office application while using the same backend business contracts.

## Scope and modules

| Module | Responsibility |
| --- | --- |
| Authentication | Customer login, session state, route protection, and API authentication. |
| Dashboard | Customer-level summary and recent activity. |
| Products | Catalog visibility for products available to the customer. |
| Quotes | Quote listing and quote details. |
| Orders | Customer order listing and details. |
| Invoices | Customer invoice listing and details. |
| Payments | Payment history and payment registration or supporting information. |
| Profile | Customer profile and account information. |

Module-specific references are maintained in [docs/modules/README.md](docs/modules/README.md).

## Frontend architecture

- Angular standalone components with lazy-loaded portal routes.
- Feature code under `src/app/features`, shared UI under `src/app/shared`, and cross-cutting services under `src/app/core`.
- Signals for view state and RxJS for API flows.
- Route guards and HTTP interceptors protect portal resources and attach authentication context.
- PrimeNG 21 and Tailwind CSS 4 provide the visual system.
- The portal consumes portal-scoped API resources; authorization and customer ownership remain enforced by the backend.

## Runtime stack

| Concern | Technology |
| --- | --- |
| Framework | Angular 21 with standalone components |
| Language | TypeScript 5.9 in strict mode |
| UI | PrimeNG 21, PrimeIcons, Tailwind CSS 4 |
| State and async flows | Angular Signals and RxJS |
| Charts | Chart.js and ng2-charts |
| Package manager | Bun 1.3.3 |
| Testing | Vitest with jsdom |
| Runtime | Docker Compose or Angular CLI |

## Local runtime

Prerequisites: Bun and Docker with Compose when using containers.

```bash
bun install
bun start
```

The local development server uses port `4200` by default. The portal Docker profile uses port `4000`:

```bash
docker compose --profile dev up --build
```

The container connects to the API through the shared `parsun-api_parsun-network` network. Confirm the backend URL and other environment values in the Docker and Angular configuration before changing deployment settings.

## Verification

```bash
bun run test:run
bun run build
bun run format:check
bun run e2e
```

The portal documentation index is available at [docs/README.md](docs/README.md), with module references under [docs/modules/README.md](docs/modules/README.md).
