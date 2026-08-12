import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { OrderFormDialogComponent } from '@features/orders/components/order-form-dialog/order-form-dialog.component';

describe('OrderFormDialogComponent', () => {
  let fixture: ComponentFixture<OrderFormDialogComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OrderFormDialogComponent] });
    fixture = TestBed.createComponent(OrderFormDialogComponent);
    fixture.componentRef.setInput('lines', [{ product: null, quantity: 1, unitPrice: 0 }]);
    fixture.componentRef.setInput('suggestions', []);
    fixture.componentRef.setInput('total', 0);
    fixture.detectChanges();
  });
  it('creates the form dialog', () => expect(fixture.componentInstance).toBeTruthy());
  it('emits line additions', () => {
    const listener = vi.fn();
    fixture.componentInstance.lineAdded.subscribe(listener);
    fixture.componentInstance.lineAdded.emit();
    expect(listener).toHaveBeenCalledOnce();
  });
});
