import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { InvoiceDetailDialogComponent } from '@features/invoices/components/invoice-detail-dialog/invoice-detail-dialog.component';

describe('InvoiceDetailDialogComponent', () => {
  let fixture: ComponentFixture<InvoiceDetailDialogComponent>;
  beforeEach(() => { TestBed.configureTestingModule({ imports: [InvoiceDetailDialogComponent] }); fixture = TestBed.createComponent(InvoiceDetailDialogComponent); fixture.detectChanges(); });
  it('creates the dialog', () => expect(fixture.componentInstance).toBeTruthy());
  it('maps paid invoices to success severity', () => expect(fixture.componentInstance.statusSeverity('PAID')).toBe('success'));
});
