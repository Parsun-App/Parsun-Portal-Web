import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { PaymentsPageComponent } from '@features/payments/pages/payments-page.component';
import { PaymentsService } from '@features/payments/services/application/payments.service';
import { PaymentsApiService } from '@features/payments/services/api/payments-api.service';
import { PortalPaymentList } from '@features/payments/models';

const PAYMENTS: PortalPaymentList[] = [
  {
    id: 'pay1',
    paymentNumber: 'PAG-0001',
    customerId: 'cust-1',
    amount: 200,
    paymentMethodId: 'pm-1',
    referenceNumber: null,
    paymentDate: '2026-08-02',
    status: 'APPLIED',
    appliedAmount: 200,
    createdAt: '2026-08-02',
    voucherUrl: null,
    targetInvoiceId: null,
  },
];

describe('PaymentsPageComponent', () => {
  let fixture: ComponentFixture<PaymentsPageComponent>;
  let component: PaymentsPageComponent;
  let serviceMock: {
    loading: ReturnType<typeof signal<boolean>>;
    payments: ReturnType<typeof signal<PortalPaymentList[]>>;
    detail: ReturnType<typeof signal<unknown | null>>;
    detailDialogVisible: ReturnType<typeof signal<boolean>>;
    searchTerm: ReturnType<typeof signal<string>>;
    dateFrom: ReturnType<typeof signal<string>>;
    dateTo: ReturnType<typeof signal<string>>;
    filterStatus: ReturnType<typeof signal<string | undefined>>;
    load: ReturnType<typeof vi.fn>;
    onSearch: ReturnType<typeof vi.fn>;
    onDateFilterChange: ReturnType<typeof vi.fn>;
    onStatusFilterChange: ReturnType<typeof vi.fn>;
    clearFilters: ReturnType<typeof vi.fn>;
    openDetail: ReturnType<typeof vi.fn>;
  };
  let apiMock: { getPaymentMethods: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    serviceMock = {
      loading: signal(false),
      payments: signal<PortalPaymentList[]>(PAYMENTS),
      detail: signal(null),
      detailDialogVisible: signal(false),
      searchTerm: signal(''),
      dateFrom: signal(''),
      dateTo: signal(''),
      filterStatus: signal<string | undefined>(undefined),
      load: vi.fn(),
      onSearch: vi.fn(),
      onDateFilterChange: vi.fn(),
      onStatusFilterChange: vi.fn(),
      clearFilters: vi.fn(),
      openDetail: vi.fn(),
    };

    apiMock = { getPaymentMethods: vi.fn(() => of([])) };

    await TestBed.configureTestingModule({
      imports: [PaymentsPageComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: PaymentsService, useValue: serviceMock },
        { provide: PaymentsApiService, useValue: apiMock },
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentsPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should forward the payments signal from the service', () => {
    expect(component.payments).toBe(serviceMock.payments);
  });

  it('should not count the search term as an active panel filter', () => {
    expect(component.activeFilterCount()).toBe(0);
    serviceMock.searchTerm.set('PAG-0001');
    expect(component.activeFilterCount()).toBe(0);
  });

  it('should delegate clear filters to the service', () => {
    component.clearFilters();
    expect(serviceMock.clearFilters).toHaveBeenCalledTimes(1);
  });

  it('should delegate search changes to the service', () => {
    component.onSearch('PAG-0001');
    expect(serviceMock.onSearch).toHaveBeenCalledWith('PAG-0001');
  });

  it('should delegate opening a detail to the service', () => {
    component.openDetail('pay1');
    expect(serviceMock.openDetail).toHaveBeenCalledWith('pay1');
  });

  it('should consume focus once and preserve the collection when opening a detail', async () => {
    await router.navigateByUrl('/?focus=pay1');

    expect(serviceMock.openDetail).toHaveBeenCalledWith('pay1');
  });

  it('should clear focus with replaceUrl while preserving unrelated query parameters', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(false);

    await expect(component.clearFocus()).resolves.toBeUndefined();

    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { focus: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      }),
    );
  });

  it('should close the detail and safely absorb a rejected focus cleanup', async () => {
    vi.spyOn(router, 'navigate').mockRejectedValue(new Error('navigation failed'));
    component.detailDialogVisible.set(true);

    await expect(component.clearFocus()).resolves.toBeUndefined();
    component.closeDetail();

    expect(component.detailDialogVisible()).toBe(false);
  });

  it('should use the filtered empty state when the search term is set', () => {
    serviceMock.searchTerm.set('PAG-0001');
    expect(component.emptyConfig().title).toBe('Sin resultados');
  });

  it('should use the plain empty state when there is no search term', () => {
    expect(component.emptyConfig().title).toBe('No hay pagos');
  });

  it('should map applied payments to the success severity', () => {
    expect(component.statusSeverity('APPLIED')).toBe('success');
  });

  it('should render the page title', () => {
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent.trim()).toBe('Historial de pagos');
  });
});
