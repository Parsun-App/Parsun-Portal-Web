# Design: Portal Payment Invoice Allocation — parsun-portal-web slice

## API layer

`services/api/payments-api.service.ts`:
- `payInvoice(invoiceId, request, file?: File)`, `payAllDebt(request, file?: File)`, `payPartialDebt(request, file?: File)`: build `FormData` with `request` as a JSON `Blob` part (`new Blob([JSON.stringify(request)], { type: 'application/json' })`) and `justificante` as the file part only when present — mirrors `registerPayment`'s existing construction exactly.
- New method `checkPendingPayment(invoiceId?: string): Observable<PortalPaymentList[]>` → `GET /portal/payments/pending-check` with `invoiceId` as an optional query param.

## Models

`features/payments/models/interfaces/portal-payment.interface.ts`: confirm/extend `PortalPaymentList`/`PortalPaymentDetail` with `voucherUrl: string | null` and `targetInvoiceId: string | null` to match the backend response shape.

## Component layer

`invoices-page.component.ts`:
- `submitPay()`: call `paymentsApi.payInvoice(invoiceId, request, this.payFile() ?? undefined)`.
- `submitPayAll()`: same pattern for `payAllDebt`/`payPartialDebt` with `this.payAllFile() ?? undefined`.
- On `payDialogVisible` becoming true for a given invoice: call `checkPendingPayment(invoiceId)`, store result in a signal, pass to the dialog.
- On `payAllDialogVisible` becoming true: call `checkPendingPayment()` (no `invoiceId`), same wiring.

`components/invoice-payment-dialog/`:
- New `input()` for the pending payment (nullable), rendered as a read-only block above the existing form fields (amount/method/date/reference from the pending payment, plus a "Ver justificante" `p-button` bound `[disabled]="!pendingPayment()?.voucherUrl"`, opening `pendingPayment().voucherUrl` via `window.open` — no in-app viewer exists in this portal repo, unlike `parsun-app`, so a direct browser open/download is the pragmatic choice here).
- Form below remains fully interactive/submittable regardless of the pending block's presence — no new disabling logic tied to it.

## Alternatives considered

- Blocking submission when a pending payment exists: explicitly rejected per the approved design (customer must be able to submit another payment).
- Building a shared "pending payment banner" component reusable by both dialogs vs. inlining per-dialog: prefer a single reusable presentational component inside `invoice-payment-dialog` since both dialogs already render the same `InvoicePaymentDialogComponent` differentiated by `[debtPayment]` — adding the pending-payment input there covers both call sites for free.
