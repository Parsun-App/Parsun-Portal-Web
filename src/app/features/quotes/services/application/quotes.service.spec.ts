import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { MessageService } from 'primeng/api';
import { QuotesService } from '@features/quotes/services/application/quotes.service';
import { QuotesApiService } from '@features/quotes/services/api/quotes-api.service';
import { PortalQuoteList, PortalQuoteDetail } from '@features/quotes/models';
import { QUOTES_MESSAGES } from '@features/quotes/messages/quotes.messages';

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

const DETAIL: PortalQuoteDetail = {
  id: 'q1',
  quoteNumber: 'COT-0001',
  customerId: 'cust-1',
  customerName: 'Acme Corp',
  customerRif: 'J-123',
  createdBy: 'u1',
  createdByName: 'Juan Pérez',
  status: 'DRAFT',
  expiryDate: '2026-09-01',
  notes: null,
  subtotal: 500,
  orderId: null,
  orderNumber: null,
  invoiceId: null,
  invoiceNumber: null,
  cancelledAt: null,
  cancelledReason: null,
  createdAt: '2026-08-01',
  updatedAt: '2026-08-01',
  lines: [
    { id: 'l1', productId: 'p1', productName: 'Mesa Roble', productCode: 'PROD-001', quantity: 1, unitPrice: 500, lineTotal: 500 },
  ],
};

describe('QuotesService', () => {
  let apiMock: { list: ReturnType<typeof vi.fn>; getById: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  let messageMock: { add: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    apiMock = { list: vi.fn().mockReturnValue(of([] as PortalQuoteList[])), getById: vi.fn(), create: vi.fn() };
    messageMock = { add: vi.fn() };
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  function createService(): QuotesService {
    TestBed.configureTestingModule({
      providers: [
        { provide: QuotesApiService, useValue: apiMock },
        { provide: MessageService, useValue: messageMock },
      ],
    });
    return TestBed.inject(QuotesService);
  }

  it('should load quotes on construction and update the loading state', () => {
    const pending = new Subject<PortalQuoteList[]>();
    apiMock.list.mockReturnValue(pending.asObservable());
    const service = createService();
    expect(service.loading()).toBe(true);
    pending.next(QUOTES);
    pending.complete();
    expect(service.quotes()).toEqual(QUOTES);
    expect(service.loading()).toBe(false);
  });

  it('should debounce search and reload quotes after 300ms', () => {
    apiMock.list.mockReturnValue(of(QUOTES));
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
    apiMock.list.mockReturnValue(of(QUOTES));
    const service = createService();
    const callsBefore = apiMock.list.mock.calls.length;
    service.onStatusFilterChange('DRAFT');
    expect(service.filterStatus()).toBe('DRAFT');
    expect(apiMock.list.mock.calls.length).toBe(callsBefore + 1);
    expect(apiMock.list).toHaveBeenLastCalledWith({ status: 'DRAFT' });
  });

  it('should reset search and status filters and reload', () => {
    apiMock.list.mockReturnValue(of(QUOTES));
    const service = createService();
    service.onStatusFilterChange('DRAFT');
    service.searchTerm.set('acme');
    const callsBefore = apiMock.list.mock.calls.length;
    service.clearFilters();
    expect(service.searchTerm()).toBe('');
    expect(service.filterStatus()).toBeUndefined();
    expect(apiMock.list.mock.calls.length).toBe(callsBefore + 1);
    expect(apiMock.list).toHaveBeenLastCalledWith({});
  });

  it('should load the detail and open the dialog when opening a quote', () => {
    apiMock.getById.mockReturnValue(of(DETAIL));
    const service = createService();
    service.openDetail('q1');
    expect(apiMock.getById).toHaveBeenCalledWith('q1');
    expect(service.detail()).toEqual(DETAIL);
    expect(service.detailDialogVisible()).toBe(true);
  });

  it('should close the detail dialog', () => {
    const service = createService();
    service.detailDialogVisible.set(true);
    service.closeDetail();
    expect(service.detailDialogVisible()).toBe(false);
  });

  it('should show an error toast and keep the quotes empty when the list fails', () => {
    apiMock.list.mockReturnValue(throwError(() => new Error('boom')));
    const service = createService();
    expect(messageMock.add).toHaveBeenCalledWith(QUOTES_MESSAGES.loadError);
    expect(service.loading()).toBe(false);
    expect(service.quotes()).toEqual([]);
  });

  it('should show an error toast and keep the dialog closed when the detail fails', () => {
    apiMock.getById.mockReturnValue(throwError(() => new Error('boom')));
    const service = createService();
    service.openDetail('q1');
    expect(messageMock.add).toHaveBeenCalledWith(QUOTES_MESSAGES.detailError);
    expect(service.detail()).toBeNull();
    expect(service.detailDialogVisible()).toBe(false);
  });

  it('should open and close the create dialog', () => {
    const service = createService();
    service.openCreateDialog();
    expect(service.createDialogVisible()).toBe(true);
    service.closeCreateDialog();
    expect(service.createDialogVisible()).toBe(false);
  });

  it('should not close the create dialog while a creation is in progress', () => {
    apiMock.create.mockReturnValue(new Subject<PortalQuoteDetail>().asObservable());
    const service = createService();
    service.openCreateDialog();
    service.create({ lines: [{ productId: 'p1', quantity: 1, unitPrice: 500 }] });
    expect(service.creating()).toBe(true);
    service.closeCreateDialog();
    expect(service.createDialogVisible()).toBe(true);
  });

  it('should create a quote, show success, close the dialog and reload', () => {
    apiMock.list.mockReturnValue(of(QUOTES));
    apiMock.create.mockReturnValue(of(DETAIL));
    const service = createService();
    service.openCreateDialog();
    const callsBefore = apiMock.list.mock.calls.length;
    service.create({ lines: [{ productId: 'p1', quantity: 2, unitPrice: 500 }], expiryDate: '2026-09-01' });
    expect(apiMock.create).toHaveBeenCalledWith({ lines: [{ productId: 'p1', quantity: 2, unitPrice: 500 }], expiryDate: '2026-09-01' });
    expect(messageMock.add).toHaveBeenCalledWith(QUOTES_MESSAGES.createSuccess);
    expect(service.createDialogVisible()).toBe(false);
    expect(service.creating()).toBe(false);
    expect(apiMock.list.mock.calls.length).toBe(callsBefore + 1);
  });

  it('should show an error toast and keep the dialog open when creation fails', () => {
    apiMock.create.mockReturnValue(throwError(() => new Error('boom')));
    const service = createService();
    service.openCreateDialog();
    service.create({ lines: [{ productId: 'p1', quantity: 1, unitPrice: 500 }] });
    expect(messageMock.add).toHaveBeenCalledWith(QUOTES_MESSAGES.createError);
    expect(service.createDialogVisible()).toBe(true);
    expect(service.creating()).toBe(false);
  });

  it('should forward a notification message to the toast service', () => {
    const service = createService();
    service.notify(QUOTES_MESSAGES.validationError);
    expect(messageMock.add).toHaveBeenCalledWith(QUOTES_MESSAGES.validationError);
  });
});
