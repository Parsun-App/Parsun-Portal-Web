import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { ProductDetailDialogComponent } from '@features/products/components/product-detail-dialog/product-detail-dialog.component';

const PRODUCT = {
  id: 'p1',
  code: 'PROD-001',
  name: 'Mesa Roble',
  description: 'Mesa de roble',
  categoryId: 'c1',
  categoryName: 'Muebles',
  active: true,
  photo: null,
  price: 250,
  availableStock: 8,
};

describe('ProductDetailDialogComponent', () => {
  let fixture: ComponentFixture<ProductDetailDialogComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProductDetailDialogComponent] });
    fixture = TestBed.createComponent(ProductDetailDialogComponent);
    fixture.detectChanges();
  });
  it('creates the dialog', () => expect(fixture.componentInstance).toBeTruthy());
  it('builds product photo URLs', () =>
    expect(fixture.componentInstance.buildPhotoUrl('products/photo.jpg')).toBe(
      '/api/files/products/photo.jpg',
    ));

  it('emits the selected product and quantity for order creation', () => {
    fixture.componentRef.setInput('product', PRODUCT);
    fixture.detectChanges();
    fixture.componentInstance.quantity.set(3);
    let request: unknown;
    fixture.componentInstance.createOrder.subscribe((value) => (request = value));

    fixture.componentInstance.requestOrder();

    expect(request).toEqual({ product: PRODUCT, quantity: 3 });
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('does not emit creation actions for products without stock', () => {
    fixture.componentRef.setInput('product', { ...PRODUCT, availableStock: 0 });
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.createQuote.subscribe(() => (emitted = true));

    fixture.componentInstance.requestQuote();

    expect(emitted).toBe(false);
  });
});
