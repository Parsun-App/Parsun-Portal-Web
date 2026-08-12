import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { InvoicePaymentDialogComponent } from '@features/invoices/components/invoice-payment-dialog/invoice-payment-dialog.component';

describe('InvoicePaymentDialogComponent', () => {
  let fixture: ComponentFixture<InvoicePaymentDialogComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [InvoicePaymentDialogComponent] });
    fixture = TestBed.createComponent(InvoicePaymentDialogComponent);
    fixture.componentRef.setInput('fullAmount', 120);
    fixture.componentRef.setInput('paymentMethods', []);
    fixture.detectChanges();
  });
  it('creates the dialog with its payment contract', () =>
    expect(fixture.componentInstance).toBeTruthy());
  it('receives the pending amount', () => expect(fixture.componentInstance.fullAmount()).toBe(120));
});
