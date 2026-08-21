# Spec: Portal Payment Invoice Allocation — parsun-portal-web slice

## Requirement: Voucher file selected during payment is actually sent

### Scenario: Customer pays an invoice with a receipt attached
- **Given** the customer opened the "Pagar factura" dialog and selected a file
- **When** they submit the form
- **Then** the request sent to the backend is `multipart/form-data` including the selected file as the `justificante` part

### Scenario: Customer pays debt without attaching a receipt
- **Given** the customer opened the "Pagar deuda total" dialog and selected no file
- **When** they submit the form
- **Then** the request is sent without a `justificante` part (or with it explicitly absent), and the request still succeeds

## Requirement: Payment dialogs show an existing pending payment

### Scenario: A pending payment exists for the invoice being paid
- **Given** the customer opens "Pagar factura" for an invoice that already has a PENDING payment targeting it (or a PENDING general-debt payment)
- **When** the dialog opens
- **Then** a block appears showing that payment's amount, method, date, and reference

### Scenario: No pending payment exists
- **Given** the customer opens either payment dialog and no applicable PENDING payment exists
- **When** the dialog opens
- **Then** no pending-payment block is shown
- **And** the payment form is available as normal

### Scenario: Voucher button reflects data availability
- **Given** a pending-payment block is shown with a voucher on file
- **When** the customer clicks "Ver justificante"
- **Then** the file opens/downloads via the backend-provided URL

- **Given** a pending-payment block is shown with no voucher on file
- **Then** "Ver justificante" is visible but disabled

## Requirement: Submitting a new payment is never blocked by an existing pending one

### Scenario: Customer submits another payment despite a pending one existing
- **Given** a pending-payment block is shown
- **When** the customer fills and submits the payment form anyway
- **Then** the submission proceeds normally (no client-side block)
