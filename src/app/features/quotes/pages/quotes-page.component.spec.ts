import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { QuotesPageComponent } from './quotes-page.component';
import { QuotesService } from '@features/quotes/services/application/quotes.service';
import { PortalQuoteList } from '@features/quotes/models';

const QUOTES: PortalQuoteList[] = [
  {
    id: 'q1',
    quoteNumber: 'COT-0001',
    customerId: 'cust-1',
    customerName: 'Acme Corp',
    customerRif: 'J-123',
    status: 'DRAFT',
    expiryDate: '2026-09-01',
    subtotal: 500,
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
  },
];

describe('QuotesPageComponent', () => {
  let fixture: ComponentFixture<QuotesPageComponent>;
  let component: QuotesPageComponent;
  let serviceMock: {
    loading: ReturnType<typeof signal<boolean>>;
    quotes: ReturnType<typeof signal<PortalQuoteList[]>>;
    detail: ReturnType<typeof signal<unknown | null>>;
    detailDialogVisible: ReturnType<typeof signal<boolean>>;
    searchTerm: ReturnType<typeof signal<string>>;
    filterStatus: ReturnType<typeof signal<string | undefined>>;
    onSearch: ReturnType<typeof vi.fn>;
    onStatusFilterChange: ReturnType<typeof vi.fn>;
    clearFilters: ReturnType<typeof vi.fn>;
    openDetail: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    serviceMock = {
      loading: signal(false),
      quotes: signal<PortalQuoteList[]>(QUOTES),
      detail: signal(null),
      detailDialogVisible: signal(false),
      searchTerm: signal(''),
      filterStatus: signal<string | undefined>(undefined),
      onSearch: vi.fn(),
      onStatusFilterChange: vi.fn(),
      clearFilters: vi.fn(),
      openDetail: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [QuotesPageComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: QuotesService, useValue: serviceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuotesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should forward the quotes signal from the service', () => {
    expect(component.quotes).toBe(serviceMock.quotes);
  });

  it('should count active filters from search and status', () => {
    expect(component.activeFilterCount()).toBe(0);
    serviceMock.searchTerm.set('acme');
    expect(component.activeFilterCount()).toBe(1);
    serviceMock.filterStatus.set('SENT');
    expect(component.activeFilterCount()).toBe(2);
  });

  it('should delegate clear filters to the service', () => {
    component.clearFilters();
    expect(serviceMock.clearFilters).toHaveBeenCalledTimes(1);
  });

  it('should delegate search changes to the service', () => {
    component.onSearch('acme');
    expect(serviceMock.onSearch).toHaveBeenCalledWith('acme');
  });

  it('should delegate status filter changes to the service', () => {
    component.onStatusFilterChange('SENT');
    expect(serviceMock.onStatusFilterChange).toHaveBeenCalledWith('SENT');
  });

  it('should delegate opening a detail to the service', () => {
    component.openDetail('q1');
    expect(serviceMock.openDetail).toHaveBeenCalledWith('q1');
  });

  it('should use the filtered empty state when filters are active', () => {
    serviceMock.searchTerm.set('acme');
    expect(component.emptyConfig().title).toBe('Sin resultados');
  });

  it('should use the plain empty state when there are no filters', () => {
    expect(component.emptyConfig().title).toBe('No hay presupuestos');
  });

  it('should map converted quotes to the success severity', () => {
    expect(component.statusSeverity('CONVERTED')).toBe('success');
  });

  it('should map expired quotes to the warn severity', () => {
    expect(component.statusSeverity('EXPIRED')).toBe('warn');
  });

  it('should render the page title', () => {
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent.trim()).toBe('Presupuestos');
  });

  it('should render the filtered empty state title in the template', () => {
    serviceMock.quotes.set([]);
    serviceMock.searchTerm.set('acme');
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h3');
    expect(title.textContent.trim()).toBe('Sin resultados');
  });
});
