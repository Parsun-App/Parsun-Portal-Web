import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { MessageService } from 'primeng/api';
import { PaymentsService } from '@features/payments/services/application/payments.service';
import { PaymentsApiService } from '@features/payments/services/api/payments-api.service';
import { PortalPaymentList, PortalPaymentDetail } from '@features/payments/models';
import { PAYMENTS_MESSAGES } from '@features/payments/messages/payments.messages';
import type { PagedResponse } from '@shared/models';

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

const PAGED_PAYMENTS: PagedResponse<PortalPaymentList> = {
  content: PAYMENTS,
  totalElements: PAYMENTS.length,
  totalPages: 1,
  size: 10,
  number: 0,
  first: true,
  last: true,
  empty: false,
};

const SUMMARY = { appliedTotal: 200, pendingTotal: 0, totalPayments: 1 };

const DETAIL: PortalPaymentDetail = {
  id: 'pay1',
  paymentNumber: 'PAG-0001',
  amount: 200,
  paymentMethodId: 'pm-1',
  referenceNumber: null,
  paymentDate: '2026-08-02',
  notes: null,
  status: 'APPLIED',
  appliedAmount: 200,
  createdAt: '2026-08-02',
  voucherUrl: null,
  targetInvoiceId: null,
};

describe('PaymentsService', () => {
  let apiMock: {
    list: ReturnType<typeof vi.fn>;
    getSummary: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
  };
  let messageMock: { add: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    apiMock = {
      list: vi.fn().mockReturnValue(of(PAGED_PAYMENTS)),
      getSummary: vi.fn().mockReturnValue(of(SUMMARY)),
      getById: vi.fn(),
    };
    messageMock = { add: vi.fn() };
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  function createService(): PaymentsService {
    TestBed.configureTestingModule({
      providers: [
        { provide: PaymentsApiService, useValue: apiMock },
        { provide: MessageService, useValue: messageMock },
      ],
    });
    return TestBed.inject(PaymentsService);
  }

  it('should load payments on construction and update the loading state', () => {
    const pending = new Subject<PagedResponse<PortalPaymentList>>();
    apiMock.list.mockReturnValue(pending.asObservable());
    const service = createService();
    expect(service.loading()).toBe(true);
    pending.next(PAGED_PAYMENTS);
    pending.complete();
    expect(service.payments()).toEqual(PAYMENTS);
    expect(service.totalElements()).toBe(1);
    expect(service.loading()).toBe(false);
  });

  it('should debounce search and reload payments after 300ms', () => {
    apiMock.list.mockReturnValue(of(PAGED_PAYMENTS));
    const service = createService();
    vi.useFakeTimers();
    const callsBefore = apiMock.list.mock.calls.length;
    service.onSearch('PAG-0001');
    expect(apiMock.list.mock.calls.length).toBe(callsBefore);
    vi.advanceTimersByTime(299);
    expect(apiMock.list.mock.calls.length).toBe(callsBefore);
    vi.advanceTimersByTime(1);
    expect(apiMock.list.mock.calls.length).toBe(callsBefore + 1);
    expect(apiMock.list).toHaveBeenLastCalledWith({ search: 'PAG-0001', status: 'APPLIED' }, 0, 10);
  });

  it('should reset the search term and reload', () => {
    apiMock.list.mockReturnValue(of(PAGED_PAYMENTS));
    const service = createService();
    service.searchTerm.set('PAG-0001');
    const callsBefore = apiMock.list.mock.calls.length;
    service.clearFilters();
    expect(service.searchTerm()).toBe('');
    expect(apiMock.list.mock.calls.length).toBe(callsBefore + 1);
    expect(apiMock.list).toHaveBeenLastCalledWith({ status: 'APPLIED' }, 0, 10);
  });

  it('should load the detail and open the dialog when opening a payment', () => {
    apiMock.getById.mockReturnValue(of(DETAIL));
    const service = createService();
    service.openDetail('pay1');
    expect(apiMock.getById).toHaveBeenCalledWith('pay1');
    expect(service.detail()).toEqual(DETAIL);
    expect(service.detailDialogVisible()).toBe(true);
  });

  it('should close the detail dialog', () => {
    const service = createService();
    service.detailDialogVisible.set(true);
    service.closeDetail();
    expect(service.detailDialogVisible()).toBe(false);
  });

  it('should show an error toast and keep the payments empty when the list fails', () => {
    apiMock.list.mockReturnValue(throwError(() => new Error('boom')));
    const service = createService();
    expect(messageMock.add).toHaveBeenCalledWith(PAYMENTS_MESSAGES.loadError);
    expect(service.loading()).toBe(false);
    expect(service.payments()).toEqual([]);
  });

  it('should show an error toast and keep the dialog closed when the detail fails', () => {
    apiMock.getById.mockReturnValue(throwError(() => new Error('boom')));
    const service = createService();
    service.openDetail('pay1');
    expect(messageMock.add).toHaveBeenCalledWith(PAYMENTS_MESSAGES.detailError);
    expect(service.detail()).toBeNull();
    expect(service.detailDialogVisible()).toBe(false);
  });
});
