import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { InvoicePaymentDialogComponent } from '@features/invoices/components/invoice-payment-dialog/invoice-payment-dialog.component';
import { PortalPaymentList } from '@features/payments/models';

const PENDING_PAYMENT: PortalPaymentList = {
  id: 'pay1',
  paymentNumber: 'PAG-0001',
  customerId: 'cust-1',
  amount: 150,
  paymentMethodId: 'pm-1',
  referenceNumber: 'REF-1',
  paymentDate: '2026-08-10',
  status: 'PENDING',
  appliedAmount: 0,
  createdAt: '2026-08-10',
  voucherUrl: null,
  targetInvoiceId: null,
};

describe('InvoicePaymentDialogComponent', () => {
  let fixture: ComponentFixture<InvoicePaymentDialogComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [InvoicePaymentDialogComponent] });
    fixture = TestBed.createComponent(InvoicePaymentDialogComponent);
    fixture.componentRef.setInput('fullAmount', 120);
    fixture.componentRef.setInput('paymentMethods', []);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
  });
  it('creates the dialog with its payment contract', () =>
    expect(fixture.componentInstance).toBeTruthy());
  it('receives the pending amount', () => expect(fixture.componentInstance.fullAmount()).toBe(120));

  describe('pending payment block', () => {
    it('does not render when there is no pending payment', () => {
      fixture.componentRef.setInput('pendingPayment', null);
      fixture.detectChanges();

      const block = fixture.nativeElement.querySelector('[data-testid="pending-payment-block"]');
      expect(block).toBeNull();
    });

    it('renders the amount, date and reference when a pending payment exists', () => {
      fixture.componentRef.setInput('pendingPayment', PENDING_PAYMENT);
      fixture.detectChanges();

      const block = fixture.nativeElement.querySelector('[data-testid="pending-payment-block"]');
      expect(block).not.toBeNull();
      expect(block.textContent).toContain('REF-1');
    });

    it('disables "Ver justificante" when there is no voucher on file', () => {
      fixture.componentRef.setInput('pendingPayment', { ...PENDING_PAYMENT, voucherUrl: null });
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector(
        '[data-testid="view-voucher-button"] button',
      );
      expect(button).not.toBeNull();
      expect(button.disabled).toBe(true);
    });

    it('enables "Ver justificante" and opens the voucher url when a voucher exists', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      fixture.componentRef.setInput('pendingPayment', {
        ...PENDING_PAYMENT,
        voucherUrl: 'https://example.com/voucher.pdf',
      });
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector(
        '[data-testid="view-voucher-button"] button',
      );
      expect(button.disabled).toBe(false);
      button.click();

      expect(openSpy).toHaveBeenCalledWith('https://example.com/voucher.pdf', '_blank');
    });

    it('keeps the payment form submittable regardless of a pending payment', () => {
      fixture.componentRef.setInput('pendingPayment', PENDING_PAYMENT);
      fixture.componentRef.setInput('valid', true);
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector(
        '[data-testid="submit-payment-button"] button',
      );
      expect(submitButton.disabled).toBe(false);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
