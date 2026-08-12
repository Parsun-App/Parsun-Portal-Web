import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { QuoteDetailDialogComponent } from '@features/quotes/components/quote-detail-dialog/quote-detail-dialog.component';

describe('QuoteDetailDialogComponent', () => {
  let fixture: ComponentFixture<QuoteDetailDialogComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [QuoteDetailDialogComponent] });
    fixture = TestBed.createComponent(QuoteDetailDialogComponent);
    fixture.detectChanges();
  });
  it('creates the dialog', () => expect(fixture.componentInstance).toBeTruthy());
  it('identifies drafts as editable', () =>
    expect(fixture.componentInstance.isDraft('DRAFT')).toBe(true));
});
