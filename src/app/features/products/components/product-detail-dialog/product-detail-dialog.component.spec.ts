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
  it('labels available stock as units', () =>
    expect(fixture.componentInstance.stockLabel(8)).toBe('8 unidades'));
  it('labels zero stock as sold out', () =>
    expect(fixture.componentInstance.stockLabel(0)).toBe('Agotado'));
});
