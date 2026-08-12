import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { ProductDetailDialogComponent } from '@features/products/components/product-detail-dialog/product-detail-dialog.component';

describe('ProductDetailDialogComponent', () => {
  let fixture: ComponentFixture<ProductDetailDialogComponent>;
  beforeEach(() => { TestBed.configureTestingModule({ imports: [ProductDetailDialogComponent] }); fixture = TestBed.createComponent(ProductDetailDialogComponent); fixture.detectChanges(); });
  it('creates the dialog', () => expect(fixture.componentInstance).toBeTruthy());
  it('builds product photo URLs', () => expect(fixture.componentInstance.buildPhotoUrl('products/photo.jpg')).toBe('/api/files/products/photo.jpg'));
});
