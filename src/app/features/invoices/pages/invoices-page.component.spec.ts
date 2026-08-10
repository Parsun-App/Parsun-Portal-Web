import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { InvoicesPageComponent } from './invoices-page.component';
import { InvoicesService } from '@features/invoices/services/application/invoices.service';
import { InvoicesApiService } from '@features/invoices/services/api/invoices-api.service';
import { PaymentsApiService } from '@features/payments/services/api/payments-api.service';
import { PortalInvoiceList } from '@features/invoices/models';

const INVOICES: PortalInvoiceList[] = [
  {
    id: 'i1',
    invoiceNumber: 'FAC-0001',
    customerId: 'cust-1',
    customerName: 'Acme Corp',
    status: 'PENDING_PAYMENT',
    statusLabel: 'Pendiente de Pago',
    paymentType: 'CREDIT',
    subtotal: 500,
    total: 500,
    paidAmount: 0,
    lineCount: 1,
    createdAt: '2026-08-01',
  },
];

describe('InvoicesPageComponent', () => {
  let fixture: ComponentFixture<InvoicesPageComponent>;
  let component: InvoicesPageComponent;
  let serviceMock: {
    loading: ReturnType<typeof signal<boolean>>;
    invoices: ReturnType<typeof signal<PortalInvoiceList[]>>;
    detail: ReturnType<typeof signal<unknown | null>>;
    detailDialogVisible: ReturnType<typeof signal<boolean>>;
    searchTerm: ReturnType<typeof signal<string>>;
    dateFrom: ReturnType<typeof signal<string>>;
    dateTo: ReturnType<typeof signal<string>>;
    filterStatus: ReturnType<typeof signal<string | undefined>>;
    onSearch: ReturnType<typeof vi.fn>;
    onDateFilterChange: ReturnType<typeof vi.fn>;
    onStatusFilterChange: ReturnType<typeof vi.fn>;
    clearFilters: ReturnType<typeof vi.fn>;
    openDetail: ReturnType<typeof vi.fn>;
    load: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    serviceMock = {
      loading: signal(false),
      invoices: signal<PortalInvoiceList[]>(INVOICES),
      detail: signal(null),
      detailDialogVisible: signal(false),
      searchTerm: signal(''),
      dateFrom: signal(''),
      dateTo: signal(''),
      filterStatus: signal<string | undefined>(undefined),
      onSearch: vi.fn(),
      onDateFilterChange: vi.fn(),
      onStatusFilterChange: vi.fn(),
      clearFilters: vi.fn(),
      openDetail: vi.fn(),
      load: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [InvoicesPageComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: InvoicesService, useValue: serviceMock },
        { provide: InvoicesApiService, useValue: { getSummary: vi.fn(() => of({ totalDebt: 0, pendingCount: 0, paidThisMonth: 0 })) } },
        { provide: PaymentsApiService, useValue: { getPaymentMethods: vi.fn(() => of([])) } },
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should forward the invoices signal from the service', () => {
    expect(component.invoices).toBe(serviceMock.invoices);
  });

  it('should count active filters from search and status', () => {
    expect(component.activeFilterCount()).toBe(0);
    serviceMock.searchTerm.set('acme');
    expect(component.activeFilterCount()).toBe(1);
    serviceMock.filterStatus.set('PAID');
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
    component.onStatusFilterChange('PAID');
    expect(serviceMock.onStatusFilterChange).toHaveBeenCalledWith('PAID');
  });

  it('should delegate opening a detail to the service', () => {
    component.openDetail('i1');
    expect(serviceMock.openDetail).toHaveBeenCalledWith('i1');
  });

  it('should use the filtered empty state when filters are active', () => {
    serviceMock.filterStatus.set('PAID');
    expect(component.emptyConfig().title).toBe('Sin resultados');
  });

  it('should use the plain empty state when there are no filters', () => {
    expect(component.emptyConfig().title).toBe('No hay facturas');
  });

  it('should map paid invoices to the success severity', () => {
    expect(component.statusSeverity('PAID')).toBe('success');
  });

  it('should render the page title', () => {
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent.trim()).toBe('Facturas');
  });
});
