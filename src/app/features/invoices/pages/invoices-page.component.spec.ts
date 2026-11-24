import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { InvoicesPageComponent } from '@features/invoices/pages/invoices-page.component';
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
  let paymentsApiMock: {
    getPaymentMethods: ReturnType<typeof vi.fn>;
    payInvoice: ReturnType<typeof vi.fn>;
    payAllDebt: ReturnType<typeof vi.fn>;
    payPartialDebt: ReturnType<typeof vi.fn>;
    checkPendingPayment: ReturnType<typeof vi.fn>;
  };
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

    paymentsApiMock = {
      getPaymentMethods: vi.fn(() => of([])),
      payInvoice: vi.fn(() => of(undefined)),
      payAllDebt: vi.fn(() => of(undefined)),
      payPartialDebt: vi.fn(() => of(undefined)),
      checkPendingPayment: vi.fn(() => of([])),
    };

    await TestBed.configureTestingModule({
      imports: [InvoicesPageComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: InvoicesService, useValue: serviceMock },
        {
          provide: InvoicesApiService,
          useValue: {
            getSummary: vi.fn(() =>
              of({ totalDebt: 0, pendingCount: 0, paidThisMonth: 0, pendingApprovalAmount: 0 }),
            ),
          },
        },
        { provide: PaymentsApiService, useValue: paymentsApiMock },
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

  it('should count panel filters without counting the search term', () => {
    expect(component.activeFilterCount()).toBe(0);
    serviceMock.searchTerm.set('acme');
    expect(component.activeFilterCount()).toBe(0);
    serviceMock.filterStatus.set('PAID');
    expect(component.activeFilterCount()).toBe(1);
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

  it('should match the app severity for draft and pending invoices', () => {
    expect(component.statusSeverity('DRAFT')).toBe('secondary');
    expect(component.statusSeverity('PENDING_PAYMENT')).toBe('info');
  });

  it('should query the pending payment for the invoice when opening the pay dialog', () => {
    component.openPayDialog(INVOICES[0]);

    expect(paymentsApiMock.checkPendingPayment).toHaveBeenCalledWith('i1');
  });

  it('should expose the pending payment returned for the invoice being paid', () => {
    const pending = {
      id: 'pay1',
      paymentNumber: 'PAG-0001',
      customerId: 'cust-1',
      amount: 100,
      paymentMethodId: 'm1',
      referenceNumber: 'REF-1',
      paymentDate: '2026-08-10',
      status: 'PENDING',
      appliedAmount: 0,
      createdAt: '2026-08-10',
      voucherUrl: null,
      targetInvoiceId: 'i1',
    };
    paymentsApiMock.checkPendingPayment.mockReturnValue(of([pending]));

    component.openPayDialog(INVOICES[0]);

    expect(component.payPendingPayment()).toEqual(pending);
  });

  it('should expose no pending payment when none exists for the invoice', () => {
    paymentsApiMock.checkPendingPayment.mockReturnValue(of([]));

    component.openPayDialog(INVOICES[0]);

    expect(component.payPendingPayment()).toBeNull();
  });

  it('should query the pending payment for the general debt when opening the pay-all dialog', () => {
    component.openPayAll();

    expect(paymentsApiMock.checkPendingPayment).toHaveBeenCalledWith();
  });

  it('should expose the pending payment returned for the general debt', () => {
    const pending = {
      id: 'pay2',
      paymentNumber: 'PAG-0002',
      customerId: 'cust-1',
      amount: 300,
      paymentMethodId: 'm1',
      referenceNumber: null,
      paymentDate: '2026-08-10',
      status: 'PENDING',
      appliedAmount: 0,
      createdAt: '2026-08-10',
      voucherUrl: 'https://example.com/voucher.pdf',
      targetInvoiceId: null,
    };
    paymentsApiMock.checkPendingPayment.mockReturnValue(of([pending]));

    component.openPayAll();

    expect(component.payAllPendingPayment()).toEqual(pending);
  });

  it('should cap the debt payment at total debt minus pending approval', () => {
    component.totalDebt.set(200);
    component.pendingApprovalAmount.set(50);

    component.openPayAll();

    expect(component.payableDebt()).toBe(150);
    expect(component.payAllAmount()).toBe(150);
  });

  it('should cap the invoice payment at balance minus pending approval', () => {
    component.openPayDialog({
      ...INVOICES[0],
      total: 200,
      paidAmount: 50,
      pendingApprovalAmount: 30,
    });

    expect(component.payFullAmount()).toBe(120);
    expect(component.payAmount()).toBe(120);
  });

  it('should forward the selected voucher file when paying an invoice', () => {
    const file = new File(['content'], 'voucher.pdf', { type: 'application/pdf' });
    component.payInvoiceId.set('i1');
    component.payAmount.set(100);
    component.payMethodId.set('m1');
    component.payReference.set('REF-1');
    component.payFile.set(file);

    component.submitPay();

    expect(paymentsApiMock.payInvoice).toHaveBeenCalledWith(
      'i1',
      expect.objectContaining({ amount: 100, paymentMethodId: 'm1' }),
      file,
    );
  });

  it('should pass undefined when paying an invoice without a voucher file', () => {
    component.payInvoiceId.set('i1');
    component.payAmount.set(100);
    component.payMethodId.set('m1');
    component.payReference.set('REF-1');
    component.payFile.set(null);

    component.submitPay();

    expect(paymentsApiMock.payInvoice).toHaveBeenCalledWith(
      'i1',
      expect.objectContaining({ amount: 100, paymentMethodId: 'm1' }),
      undefined,
    );
  });

  it('should forward the selected voucher file when paying the full debt', () => {
    const file = new File(['content'], 'voucher.pdf', { type: 'application/pdf' });
    component.totalDebt.set(200);
    component.payAllAmount.set(200);
    component.payAllMethodId.set('m1');
    component.payAllReference.set('REF-1');
    component.payAllFile.set(file);

    component.submitPayAll();

    expect(paymentsApiMock.payAllDebt).toHaveBeenCalledWith(
      expect.objectContaining({ paymentMethodId: 'm1' }),
      file,
    );
  });

  it('should forward the selected voucher file when paying a partial debt amount', () => {
    const file = new File(['content'], 'voucher.pdf', { type: 'application/pdf' });
    component.totalDebt.set(200);
    component.payAllAmount.set(50);
    component.payAllMethodId.set('m1');
    component.payAllReference.set('REF-1');
    component.payAllFile.set(file);

    component.submitPayAll();

    expect(paymentsApiMock.payPartialDebt).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 50, paymentMethodId: 'm1' }),
      file,
    );
  });

  it('should render the page title', () => {
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent.trim()).toBe('Facturas');
  });
});
