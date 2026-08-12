import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { QuoteFormDialogComponent } from '@features/quotes/components/quote-form-dialog/quote-form-dialog.component';
import { OrderFormDialogComponent } from '@features/orders/components/order-form-dialog/order-form-dialog.component';
import { By } from '@angular/platform-browser';

describe('QuoteFormDialogComponent', () => {
  let fixture: ComponentFixture<QuoteFormDialogComponent>;
  beforeEach(() => { TestBed.configureTestingModule({ imports: [QuoteFormDialogComponent] }); fixture = TestBed.createComponent(QuoteFormDialogComponent); fixture.componentRef.setInput('lines', [{ product: null, quantity: 1, unitPrice: 0 }]); fixture.componentRef.setInput('suggestions', []); fixture.componentRef.setInput('total', 0); fixture.detectChanges(); });
  it('creates the quote form dialog', () => expect(fixture.componentInstance).toBeTruthy());
  it('uses the quote-specific entity label', () => {
    const form = fixture.debugElement.query(By.directive(OrderFormDialogComponent)).componentInstance as OrderFormDialogComponent;
    expect(form.entityLabel()).toBe('presupuesto');
  });
});
