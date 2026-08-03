import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { MessageService } from 'primeng/api';
import { InvoicesService } from '@features/invoices/services/application/invoices.service';
import { InvoicesApiService } from '@features/invoices/services/api/invoices-api.service';
import { PortalInvoiceList, PortalInvoiceDetail } from '@features/invoices/models';
import { INVOICES_MESSAGES } from '@features/invoices/messages/invoices.messages';

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

const DETAIL: PortalInvoiceDetail = {
  id: 'i1',
  invoiceNumber: 'FAC-0001',
  customerId: 'cust-1',
  customerName: 'Acme Corp',
  customerRif: 'J-123',
  status: 'PENDING_PAYMENT',
  paymentType: 'CREDIT',
  notes: null,
  subtotal: 500,
  createdAt: '2026-08-01',
  lines: [
    { id: 'l1', productId: 'p1', productName: 'Mesa Roble', productCode: 'PROD-001', quantity: 1, unitPrice: 500, lineTotal: 500 },
  ],
};

describe('InvoicesService', () => {
  let apiMock: { list: ReturnType<typeof vi.fn>; getById: ReturnType<typeof vi.fn> };
  let messageMock: { add: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    apiMock = { list: vi.fn().mockReturnValue(of([] as PortalInvoiceList[])), getById: vi.fn() };
    messageMock = { add: vi.fn() };
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  function createService(): InvoicesService {
    TestBed.configureTestingModule({
      providers: [
        { provide: InvoicesApiService, useValue: apiMock },
        { provide: MessageService, useValue: messageMock },
      ],
    });
    return TestBed.inject(InvoicesService);
  }

  it('should load invoices on construction and update the loading state', () => {
    const pending = new Subject<PortalInvoiceList[]>();
    apiMock.list.mockReturnValue(pending.asObservable());
    const service = createService();
    expect(service.loading()).toBe(true);
    pending.next(INVOICES);
    pending.complete();
    expect(service.invoices()).toEqual(INVOICES);
    expect(service.loading()).toBe(false);
  });

  it('should debounce search and reload invoices after 300ms', () => {
    apiMock.list.mockReturnValue(of(INVOICES));
    const service = createService();
    vi.useFakeTimers();
    const callsBefore = apiMock.list.mock.calls.length;
    service.onSearch('acme');
    expect(apiMock.list.mock.calls.length).toBe(callsBefore);
    vi.advanceTimersByTime(299);
    expect(apiMock.list.mock.calls.length).toBe(callsBefore);
    vi.advanceTimersByTime(1);
    expect(apiMock.list.mock.calls.length).toBe(callsBefore + 1);
    expect(apiMock.list).toHaveBeenLastCalledWith({ search: 'acme' });
  });

  it('should reload immediately when the status filter changes', () => {
    apiMock.list.mockReturnValue(of(INVOICES));
    const service = createService();
    const callsBefore = apiMock.list.mock.calls.length;
    service.onStatusFilterChange('PAID');
    expect(service.filterStatus()).toBe('PAID');
    expect(apiMock.list.mock.calls.length).toBe(callsBefore + 1);
    expect(apiMock.list).toHaveBeenLastCalledWith({ status: 'PAID' });
  });

  it('should reset search and status filters and reload', () => {
    apiMock.list.mockReturnValue(of(INVOICES));
    const service = createService();
    service.onStatusFilterChange('PAID');
    service.searchTerm.set('acme');
    const callsBefore = apiMock.list.mock.calls.length;
    service.clearFilters();
    expect(service.searchTerm()).toBe('');
    expect(service.filterStatus()).toBeUndefined();
    expect(apiMock.list.mock.calls.length).toBe(callsBefore + 1);
    expect(apiMock.list).toHaveBeenLastCalledWith({});
  });

  it('should load the detail and open the dialog when opening an invoice', () => {
    apiMock.getById.mockReturnValue(of(DETAIL));
    const service = createService();
    service.openDetail('i1');
    expect(apiMock.getById).toHaveBeenCalledWith('i1');
    expect(service.detail()).toEqual(DETAIL);
    expect(service.detailDialogVisible()).toBe(true);
  });

  it('should close the detail dialog', () => {
    const service = createService();
    service.detailDialogVisible.set(true);
    service.closeDetail();
    expect(service.detailDialogVisible()).toBe(false);
  });

  it('should show an error toast and keep the invoices empty when the list fails', () => {
    apiMock.list.mockReturnValue(throwError(() => new Error('boom')));
    const service = createService();
    expect(messageMock.add).toHaveBeenCalledWith(INVOICES_MESSAGES.loadError);
    expect(service.loading()).toBe(false);
    expect(service.invoices()).toEqual([]);
  });

  it('should show an error toast and keep the dialog closed when the detail fails', () => {
    apiMock.getById.mockReturnValue(throwError(() => new Error('boom')));
    const service = createService();
    service.openDetail('i1');
    expect(messageMock.add).toHaveBeenCalledWith(INVOICES_MESSAGES.detailError);
    expect(service.detail()).toBeNull();
    expect(service.detailDialogVisible()).toBe(false);
  });
});
