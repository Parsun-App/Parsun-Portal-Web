# Portal Modules

This directory documents the customer-facing Angular portal. Each module is standalone, route-driven, and delegates HTTP calls to an API service plus an application service.

| Module | Route | Responsibility |
|---|---|---|
| Auth | `/login` | Portal login, refresh, logout, password change |
| Dashboard | `/dashboard` | Customer summary and activity |
| Invoices | `/invoices` | Invoice list, summary, and details |
| Orders | `/orders` | Create, update, confirm, and cancel orders |
| Payments | `/payments` | Payment history, methods, proofs, and pending checks |
| Products | `/products` | Customer catalog and catalog PDF |
| Profile | `/profile` | Customer profile and password dialog |
| Quotes | `/quotes` | Quote list, creation, update, cancellation, conversion |

## Shared rules

- Authenticated requests use the portal interceptor and customer-scoped endpoints.
- Components are standalone and use OnPush change detection.
- API services map `/api/portal/*` contracts; application services own loading, errors, and user messages.
- Payment proof uploads use multipart form data and remain pending until back-office validation.
