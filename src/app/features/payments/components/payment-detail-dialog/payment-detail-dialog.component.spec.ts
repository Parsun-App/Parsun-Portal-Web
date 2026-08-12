import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { PaymentDetailDialogComponent } from '@features/payments/components/payment-detail-dialog/payment-detail-dialog.component';

describe('PaymentDetailDialogComponent', () => {
  let fixture: ComponentFixture<PaymentDetailDialogComponent>;
  beforeEach(() => { TestBed.configureTestingModule({ imports: [PaymentDetailDialogComponent] }); fixture = TestBed.createComponent(PaymentDetailDialogComponent); fixture.detectChanges(); });
  it('creates the dialog', () => expect(fixture.componentInstance).toBeTruthy());
  it('maps rejected payments to danger severity', () => expect(fixture.componentInstance.statusSeverity('REJECTED')).toBe('danger'));
});
