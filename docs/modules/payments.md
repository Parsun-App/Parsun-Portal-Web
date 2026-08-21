# Portal Payments

Route: `/payments` and payment dialogs embedded in invoice views.

The module lists payments, loads methods, registers invoice/debt/partial payments, and uploads optional proof files. Requests use multipart form data against `/api/portal/invoices/{id}/pay`, `/debt/pay`, `/debt/pay-partial`, and `/payments/register`.

Portal payments are pending until a finance user approves them. `pending-check` prevents duplicate pending payments for the same invoice.
