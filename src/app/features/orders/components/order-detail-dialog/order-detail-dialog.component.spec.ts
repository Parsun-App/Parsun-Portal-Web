import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { OrderDetailDialogComponent } from '@features/orders/components/order-detail-dialog/order-detail-dialog.component';

describe('OrderDetailDialogComponent', () => {
  let fixture: ComponentFixture<OrderDetailDialogComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OrderDetailDialogComponent] });
    fixture = TestBed.createComponent(OrderDetailDialogComponent);
    fixture.detectChanges();
  });
  it('creates the dialog', () => expect(fixture.componentInstance).toBeTruthy());
  it('identifies customer drafts as editable', () =>
    expect(fixture.componentInstance.isDraft('CUSTOMER_DRAFT')).toBe(true));
  it('maps customer drafts to the warn severity', () =>
    expect(fixture.componentInstance.statusSeverity('CUSTOMER_DRAFT')).toBe('warn'));
});
