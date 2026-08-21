# Testing Guide

The portal uses Vitest for component and service tests and Playwright for browser-level end-to-end tests.

## Unit and integration tests

```bash
bun run test:run
bun run test:coverage
```

## End-to-end tests with Playwright

The Playwright smoke suite verifies the customer login entry point and redirects unauthenticated users away from protected routes. It does not require backend credentials or modify application data.

```bash
bun run e2e
bun run e2e:headed
bun run e2e:ui
bun run e2e:report
```

Tests are located in `e2e/`, and the browser configuration is in `playwright.config.ts`. Playwright starts the portal on port `4301` when no existing server is available. Install the browser binaries once with:

```bash
bunx playwright install chromium
```
