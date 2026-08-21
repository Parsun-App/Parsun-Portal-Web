# Customer Portal E2E Implementation Checklist

This checklist turns [E2E_TEST_PROPOSAL.md](E2E_TEST_PROPOSAL.md) into implementation work. Check an item only after the test, fixture, and evidence have been verified in the target environment.

## Phase 0 — Contract and data readiness

- [ ] Confirm `/auth/login`, `/dashboard`, `/products`, `/quotes`, `/orders`, `/invoices`, `/payments`, and `/profile` routes.
- [ ] Confirm every `/api/portal/*` method used by the feature services.
- [ ] Confirm portal customer seed with access enabled and a second customer for ownership tests.
- [ ] Create customer with no activity and customer with unpaid invoice fixtures.
- [ ] Define proof-file MIME types, maximum size, storage location, and cleanup policy.
- [ ] Choose disposable database, tenant, or API cleanup isolation for CI.
- [ ] Add CI secrets without committing customer credentials.

## Phase 1 — Playwright foundation

- [ ] Add API login helper and `portal-customer` storage state.
- [ ] Add second-customer and no-activity storage/fixture states.
- [ ] Add API factories for quote, order, invoice, payment, and proof records.
- [ ] Add cleanup in reverse dependency order.
- [ ] Add navigation, ownership, toast, loading, error, and download helpers.
- [ ] Add request assertions for method, path, query, status, and customer context.
- [ ] Configure Chromium desktop/mobile projects and failure artifacts.
- [ ] Configure smoke, acceptance, and workflow commands in CI.

## Phase 2 — Authentication and shell

- [ ] Successful login with valid RIF/password redirects to `/dashboard`.
- [ ] Invalid RIF, password, disabled portal access, and malformed RIF.
- [ ] Empty-field validation prevents request.
- [ ] Access/refresh token persistence and token cleanup.
- [ ] Protected-route redirect without a session.
- [ ] Session restoration after reload.
- [ ] Access-token refresh and refresh failure.
- [ ] Logout calls backend, clears state, and blocks protected routes.
- [ ] Change-password success, wrong current password, weak password, and mismatch.

## Phase 3 — Customer portal modules

### Dashboard

- [ ] Summary cards and recent activity render customer-scoped data.
- [ ] Empty activity, zero-balance, loading, retry, and API-error states.
- [ ] Reload refreshes data without stale or foreign customer values.

### Products

- [ ] Catalog list, price type, active availability, search, pagination, and page size.
- [ ] Empty results and unavailable product behavior.
- [ ] Catalog PDF download MIME type, filename, and non-zero size.

### Quotes

- [ ] List/filter/pagination and detail.
- [ ] Create valid quote with customer-visible products and quantities.
- [ ] Required fields, invalid quantity, unavailable product, and empty lines.
- [ ] Edit only supported statuses and preserve server totals.
- [ ] Cancel with required reason.
- [ ] Convert once and reject duplicate conversion.
- [ ] Cross-customer quote ID cannot be read or changed.

### Orders

- [ ] List/filter/pagination, detail, totals, and status labels.
- [ ] Create/edit valid draft with line validation.
- [ ] Confirm and cancel with confirmation/reason.
- [ ] Reject invalid/duplicate/terminal actions.
- [ ] Cross-customer order ID cannot be read or changed.
- [ ] Confirmed order is visible to the back-office processing workflow.

### Invoices

- [ ] List/filter, summary, detail, balance, due date, and status.
- [ ] Empty list and API failure recovery.
- [ ] Cross-customer invoice ID cannot be read or downloaded.
- [ ] Portal balance matches back-office balance after payment approval.

### Payments

- [ ] History/filter/detail and payment-method list.
- [ ] Register partial and full payment with method, date, reference, amount, and proof.
- [ ] Required fields, invalid amount, overpayment, already-paid invoice, file type, and file size.
- [ ] Prevent duplicate registration and preserve input after recoverable error.
- [ ] Pending-check state appears after registration.
- [ ] Cross-customer invoice/payment IDs cannot be used.
- [ ] Payment proof is visible in back-office pending receivables.

### Profile

- [ ] Profile loads with customer-scoped data.
- [ ] Editable fields validate and refresh after success where supported.
- [ ] Password dialog success, current-password failure, complexity, mismatch, loading, and API error.
- [ ] Session expiry/logout clears stale profile data.

## Phase 4 — Cross-application workflows

- [ ] Portal quote → order and verify result in portal/back-office.
- [ ] Portal order → back-office processing → portal invoice visibility.
- [ ] Portal payment proof → back-office pending detail → approve → portal balance/history refresh.
- [ ] Portal payment proof → reject → no invoice/summary financial application.
- [ ] Repeat approval/rejection and verify idempotent handling.
- [ ] Verify customer ownership at every handoff.

## Phase 5 — Accessibility, responsive behavior, and reliability

- [ ] Accessible labels, headings, buttons, and form errors.
- [ ] Keyboard navigation and dialog focus return.
- [ ] Mobile layout for login, tables, forms, dialogs, and payment upload.
- [ ] Loading indicators resolve on success and failure.
- [ ] 401/403/404/409/422/500 states are readable and recoverable.
- [ ] No fixed sleeps; use response or UI state waits.
- [ ] Validate PDF/download evidence and upload error evidence.
- [ ] Capture trace, screenshot, video, and API summary on failure.

## Phase 6 — CI and completion gate

- [ ] Smoke tests run on every pull request.
- [ ] Full portal acceptance runs on protected branches.
- [ ] Cross-application workflows run nightly or before release.
- [ ] Test data cleanup succeeds after pass and failure.
- [ ] No test relies on another customer's permanent data.
- [ ] No unexplained retries or quarantined critical tests remain.
- [ ] Every portal route has a dedicated spec.
- [ ] Every mutation has success, validation, ownership, and server-error coverage where applicable.
- [ ] The proposal and checklist are updated when portal routes or API contracts change.
