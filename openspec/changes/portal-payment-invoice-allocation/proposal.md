# Proposal: Portal Payment Invoice Allocation — parsun-portal-web slice

## Intent

Fix a confirmed frontend bug where the voucher/receipt file a customer selects when paying (`payFile`/`payAllFile` signals) is silently dropped and never sent to the backend, now that the backend (sibling `parsun-api` change, same change name) accepts multipart uploads on all 3 payment endpoints. Also surface an existing PENDING payment (if any) in both payment dialogs, with a "Ver justificante" button, so customers see the state of a payment they already submitted before submitting another.

## Why

- **Real bug**: customers attach a receipt, it's accepted by the UI, and then thrown away before the request is sent — confirmed by reading `submitPay()`/`submitPayAll()` in `invoices-page.component.ts`, which build plain JSON and never read the file signals.
- **UX correctness**: without visibility into an existing pending payment, customers may not realize they already submitted one and could be confused about invoice/debt state during the approval window.

## Scope

In scope:
- `PaymentsApiService`: convert `payInvoice`, `payAllDebt`, `payPartialDebt` to send `FormData` (JSON `request` part + optional `justificante` file part), mirroring the already-correct `registerPayment` method.
- `submitPay()` / `submitPayAll()` in `invoices-page.component.ts`: actually pass `payFile()`/`payAllFile()` through to the (now multipart) API calls.
- New API method + model for `GET /api/portal/payments/pending-check?invoiceId={optional}`.
- `InvoicePaymentDialogComponent` (or the page around it): on open, query pending-check (with `invoiceId` for the "Pagar factura" dialog, without it for the "Pagar deuda total" dialog) and render a block with amount/method/date/reference plus a "Ver justificante" button — always visible, disabled when no voucher.
- Payment form stays available/submittable below that block regardless of an existing pending payment (explicit decision: do not block submission).

Out of scope: the orphaned "Registrar pago" flow in `features/payments/pages/payments-page.component.ts` (already correctly builds `FormData` but is unreachable UI — noted for the user, not touched here since it's not part of the approved design and touching unrelated dead code risks scope creep on a money-bug fix).

## Risks

- Wire-format change for 3 endpoints must land in lockstep with the `parsun-api` change — both are part of this same cross-repo change and will be verified together.
- `p-fileupload` `mode="basic"` UX for showing an already-selected file needs to keep working once wired into `FormData` — verify manually/in tests that selecting, then submitting, actually round-trips.

## Rollback

`git revert` on both repos together (this frontend change is inert/broken without the backend accepting multipart, and vice versa the backend change is backward compatible with the old JSON-only frontend only insofar as the old frontend simply continues to drop the file — no data corruption risk either direction).
