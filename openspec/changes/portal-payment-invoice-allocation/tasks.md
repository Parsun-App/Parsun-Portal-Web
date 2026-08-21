# Tasks: Portal Payment Invoice Allocation (parsun-portal-web)

TDD throughout. Run `bun run test:run` from `parsun-portal-web/`.

1. [ ] Failing tests for `PaymentsApiService.payInvoice`/`payAllDebt`/`payPartialDebt` sending `FormData` with/without a file — then implement.
2. [ ] Failing test for new `checkPendingPayment(invoiceId?)` → correct query param handling — then implement.
3. [ ] Extend `portal-payment.interface.ts` with `voucherUrl`/`targetInvoiceId`.
4. [ ] Failing tests for `submitPay()`/`submitPayAll()` actually forwarding the selected file — then fix.
5. [ ] Failing tests for `invoice-payment-dialog.component` rendering the pending-payment block (present/absent) and the voucher button disabled state — then implement.
6. [ ] Wire `checkPendingPayment` calls into `invoices-page.component.ts` dialog-open handlers.
7. [ ] `bun run test:run` + `bun run format:check` clean.
8. [ ] Manual/E2E check plan (documented in Verify) since no Playwright MCP confirmed available yet — confirm during Verify phase.
