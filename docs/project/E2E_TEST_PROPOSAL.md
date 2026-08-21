# Customer Portal End-to-End Testing Proposal by Module

This proposal defines the Playwright end-to-end testing program for `parsun-portal-web`. It covers the customer-facing routes, the `/api/portal/*` contracts consumed by the portal, customer ownership rules, and the workflows that must remain compatible with the Parsun back-office application.

## Outcome

The target state is a repeatable browser suite that proves:

1. Customers can authenticate, recover their session, change their password, and log out safely.
2. Every portal module can load, display customer-scoped data, validate input, and recover from API failures.
3. Quotes and orders follow their allowed state transitions and cannot be accessed across customers.
4. Invoices and payments show accurate financial information, including pending payment proofs.
5. Portal actions create records that are visible and processable in the back-office application.
6. Critical customer actions work on desktop and mobile viewports with accessible controls.

The current smoke suite covers the login shell and unauthenticated redirects only. The cases below define the full acceptance scope.

## Routes and API boundaries

| Module | Route | API boundary |
| --- | --- | --- |
| Authentication | `/auth/login` | `/api/portal/auth/login`, `/refresh`, `/logout`, `/change-password` |
| Dashboard | `/dashboard` | `/api/portal/dashboard` |
| Products | `/products` | `/api/portal/products`, `/catalog/pdf` |
| Quotes | `/quotes` | `/api/portal/quotes` and quote actions |
| Orders | `/orders` | `/api/portal/orders` and order actions |
| Invoices | `/invoices` | `/api/portal/invoices`, `/summary` |
| Payments | `/payments` | `/api/portal/payments`, `/payment-methods`, `/payments/register`, `/payments/pending-check` |
| Profile | `/profile` | `/api/portal/profile` and profile/password actions |

## Test layers

| Layer | Coverage | Execution |
| --- | --- | --- |
| Smoke | Login page, protected-route redirect, portal shell startup. | Every branch and pull request. |
| Module acceptance | Route, list, detail, forms, filters, validation, errors, and persisted result for each module. | Protected branches and release candidates. |
| Ownership and security | Customer-scoped data, invalid tokens, 401/403, logout, refresh, and cross-customer IDs. | Every release candidate. |
| Workflow | Quote → order, order → back-office invoice, invoice → payment proof → back-office validation. | Protected branches and nightly. |
| Presentation | Mobile layout, accessible names, keyboard actions, dialogs, file upload, and downloads. | Nightly and release candidates. |

The real API must be used for authentication, mutations, ownership, and financial workflows. Route interception is reserved for deterministic loading, empty, and server-error states.

## Test identities and data isolation

Credentials must be supplied by CI secrets or an untracked local environment file. Do not place real passwords in specs.

| Fixture | Purpose |
| --- | --- |
| Customer with portal access | Main happy-path user with a known price type, products, quotes, orders, and invoices. |
| Customer without portal access | Login denial and access-control cases. |
| Second customer with similar data | Cross-customer ownership and ID substitution tests. |
| Customer with unpaid invoice | Partial/full payment and pending-proof workflows. |
| Customer with no activity | Empty dashboard, lists, and payment history states. |

Every mutation uses a run-specific prefix and a disposable fixture. Setup may use API helpers, but the behavior under test must be performed through the browser. Teardown removes or expires created quotes, orders, payment proofs, and profile changes in reverse dependency order.

## Module coverage

### Authentication `/auth/login`

- Successful login with a valid RIF and password redirects to `/dashboard`.
- Invalid RIF, invalid password, and portal access disabled show a recoverable error without storing tokens.
- Empty fields, malformed RIF, and password validation prevent submission.
- Access and refresh tokens are persisted only after success and removed on logout.
- Reloading a protected route restores the session; an expired access token invokes refresh once.
- Refresh failure clears the session and redirects to `/auth/login`.
- Logout calls the backend, clears local state, and makes protected routes inaccessible.
- Change-password validates current password, complexity, confirmation, success, and failure states.

### Dashboard `/dashboard`

- Summary cards and recent activity render from the customer-scoped API response.
- Empty activity and zero-balance states are intentional and readable.
- Loading indicators resolve for success and failure; a failed widget does not freeze the page.
- Reloading refreshes data without exposing another customer's values.

### Products `/products`

- Catalog renders with the customer's applicable price type and product availability.
- Search, pagination, page-size changes, and empty results work together.
- Inactive/unavailable products are not purchasable.
- Catalog PDF download has a successful response, expected MIME type, filename, and non-zero size.
- API 401/403/500 states show a usable message and retry path.

### Quotes `/quotes`

- List, search/filter, pagination, detail, and totals render correctly.
- Create quote with valid products, quantities, and customer-owned data.
- Required fields, invalid quantities, unavailable products, and empty lines block submission.
- Edit is allowed only in the supported status and preserves server totals.
- Cancel requires a reason and updates status after confirmation.
- Conversion creates an order exactly once and prevents a second conversion.
- A quote ID belonging to another customer returns a safe not-found/forbidden experience.

### Orders `/orders`

- List, filters, pagination, detail, totals, and status labels render correctly.
- Create and edit valid drafts with line validation and server-calculated totals.
- Confirm and cancel actions require confirmation; cancel requires a reason.
- Invalid, duplicate, and terminal-state actions are rejected without duplicate requests.
- Cross-customer order IDs cannot reveal details or mutate state.
- A confirmed portal order is visible to the back-office workflow that processes it.

### Invoices `/invoices`

- Invoice list, filters, detail, balance, due date, status, and summary render correctly.
- Empty invoice state and API failure are handled without a stuck loader.
- Invoice identifiers from another customer cannot be read or downloaded.
- The amount and balance shown here match the back-office invoice after payment validation.

### Payments `/payments`

- Payment history, filters, detail, and payment methods render from portal-scoped APIs.
- Payment registration validates invoice selection, amount, method, date, reference, and proof file.
- Partial payment, full payment, and pending-check states are displayed correctly.
- Unsupported file type, oversized file, invalid amount, overpayment, duplicate submit, and already-paid invoice are rejected.
- Successful multipart registration appears in the portal pending list and back-office pending receivables.
- A payment belonging to another customer cannot be queried or registered against.
- Payment API failures preserve user input and provide retry/cancel behavior.

### Profile `/profile`

- Profile data loads for the authenticated customer and remains customer-scoped.
- Editable fields, where enabled, validate and refresh after success.
- Password dialog validates current password, complexity, confirmation, loading, success, and server failure.
- Logout or session expiry from the profile returns to the login route without stale profile data.

## Cross-application workflows

### Quote to order

1. Create a quote in the portal with valid catalog products.
2. Verify totals and quote status in the portal.
3. Convert or process the quote into an order according to the supported portal workflow.
4. Verify the resulting order in the portal and back-office app.

### Portal order to invoice

1. Create and confirm an order as the portal customer.
2. Process it through the back-office order/invoice workflow.
3. Verify invoice status, due date, lines, and balance in the portal.

### Payment proof validation

1. Register a payment from the portal with method, amount, date, reference, and proof.
2. Verify the pending payment and invoice/customer details in back-office receivables.
3. Approve the payment and verify portal history, invoice balance, dashboard summary, and back-office totals.
4. Repeat with rejection and verify no financial application.
5. Attempt a second decision and verify idempotent handling.

## Shared assertions

Every portal spec must assert the applicable items below:

- correct route and page heading;
- loading, success, empty, and error states;
- expected API method, path, query, and authorization context;
- validation before request and no duplicate submission;
- persisted result after a successful mutation;
- 401/403/404/409/422/500 recovery;
- customer ownership for every detail and mutation route;
- accessible labels, keyboard activation, focus return, and mobile layout;
- file upload constraints and download content type/filename/size.

## Playwright implementation plan

```text
e2e/
├── fixtures/
│   ├── portal-auth.fixture.ts
│   ├── portal-data.fixture.ts
│   └── api.fixture.ts
├── helpers/
│   ├── navigation.ts
│   ├── ownership.ts
│   └── cleanup.ts
├── auth.spec.ts
├── dashboard.spec.ts
├── products.spec.ts
├── quotes.spec.ts
├── orders.spec.ts
├── invoices.spec.ts
├── payments.spec.ts
├── profile.spec.ts
└── workflows/
    ├── quote-to-order.spec.ts
    ├── order-to-invoice.spec.ts
    └── payment-validation.spec.ts
```

- Generate `portal-customer` and `portal-customer-empty` storage states through API login.
- Keep one browser login test; reuse storage state for module acceptance tests.
- Add a second-customer fixture for ID substitution and ownership tests.
- Use accessible selectors first; add `data-testid` only for repeated icon actions, upload controls, and ambiguous status actions.
- Keep traces, screenshots, videos, and API summaries under `output/playwright/` on failure.

## Delivery phases

| Phase | Deliverable | Exit criteria |
| --- | --- | --- |
| 0 | Seed, identities, API fixture factory, reset/cleanup strategy. | All required customer states can be created deterministically. |
| 1 | Auth and shell hardening. | Login, refresh, logout, password, and protected-route tests pass. |
| 2 | Catalog and commercial modules. | Products, quotes, and orders pass acceptance and ownership suites. |
| 3 | Invoices and payments. | Invoice visibility, payment proof, invalid payment, and backend validation flows pass. |
| 4 | Dashboard and profile. | Summary, empty/error, profile, and password workflows pass. |
| 5 | Cross-application and presentation hardening. | Portal/back-office journeys, mobile, accessibility, and downloads pass. |

## Definition of done

- Every portal route has a dedicated Playwright spec.
- Every mutation has success, validation, ownership, and server-error coverage where applicable.
- Every status transition has an allowed and rejected action test.
- Portal-created records are verified in the back-office workflow that consumes them.
- No test uses another customer's ID successfully.
- Test data is isolated and cleaned after every run.
- CI runs smoke tests on every change and full portal acceptance on protected branches.
- Failures publish enough evidence to reproduce the browser and API state.

## Open decisions

1. Confirm the canonical portal customer seed and whether password changes may run against disposable users.
2. Confirm the maximum proof-file size, accepted MIME types, and storage cleanup policy.
3. Choose disposable database, tenant, or API cleanup isolation for CI.
4. Confirm whether portal order/quote conversion is performed by the portal or by back-office processing.
5. Confirm the supported browser matrix beyond Chromium.
