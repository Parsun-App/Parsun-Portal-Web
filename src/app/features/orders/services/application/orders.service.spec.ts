import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { MessageService } from 'primeng/api';
import { OrdersService } from '@features/orders/services/application/orders.service';
import { OrdersApiService } from '@features/orders/services/api/orders-api.service';
import { PortalOrderList, PortalOrderDetail } from '@features/orders/models';
import { ORDERS_MESSAGES } from '@features/orders/messages/orders.messages';

const ORDERS: PortalOrderList[] = [
  {
    id: 'o1',
    orderNumber: 'ORD-0001',
    customerId: 'cust-1',
    customerName: 'Acme Corp',
    status: 'DRAFT',
    subtotal: 500,
    lineCount: 1,
    invoiceId: null,
    createdAt: '2026-08-01',
  },
];

const DETAIL: PortalOrderDetail = {
  id: 'o1',
  orderNumber: 'ORD-0001',
  customerId: 'cust-1',
  customerName: 'Acme Corp',
  customerRif: 'J-123',
  status: 'DRAFT',
  notes: null,
  subtotal: 500,
  invoiceId: null,
  invoiceNumber: null,
  createdAt: '2026-08-01',
  lines: [
    { id: 'l1', productId: 'p1', productName: 'Mesa Roble', productCode: 'PROD-001', quantity: 1, unitPrice: 500, lineTotal: 500 },
  ],
};

describe('OrdersService', () => {
  let apiMock: { list: ReturnType<typeof vi.fn>; getById: ReturnType<typeof vi.fn>; confirm: ReturnType<typeof vi.fn>; cancel: ReturnType<typeof vi.fn> };
  let messageMock: { add: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    apiMock = { list: vi.fn().mockReturnValue(of([] as PortalOrderList[])), getById: vi.fn(), confirm: vi.fn(), cancel: vi.fn() };
    messageMock = { add: vi.fn() };
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  function createService(): OrdersService {
    TestBed.configureTestingModule({
      providers: [
        { provide: OrdersApiService, useValue: apiMock },
        { provide: MessageService, useValue: messageMock },
      ],
    });
    return TestBed.inject(OrdersService);
  }

  it('should load orders on construction and update the loading state', () => {
    const pending = new Subject<PortalOrderList[]>();
    apiMock.list.mockReturnValue(pending.asObservable());
    const service = createService();
    expect(service.loading()).toBe(true);
    pending.next(ORDERS);
    pending.complete();
    expect(service.orders()).toEqual(ORDERS);
    expect(service.loading()).toBe(false);
  });

  it('should debounce search and reload orders after 300ms', () => {
    apiMock.list.mockReturnValue(of(ORDERS));
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
    apiMock.list.mockReturnValue(of(ORDERS));
    const service = createService();
    const callsBefore = apiMock.list.mock.calls.length;
    service.onStatusFilterChange('CONFIRMED');
    expect(service.filterStatus()).toBe('CONFIRMED');
    expect(apiMock.list.mock.calls.length).toBe(callsBefore + 1);
    expect(apiMock.list).toHaveBeenLastCalledWith({ status: 'CONFIRMED' });
  });

  it('should reset search and status filters and reload', () => {
    apiMock.list.mockReturnValue(of(ORDERS));
    const service = createService();
    service.onStatusFilterChange('CONFIRMED');
    service.searchTerm.set('acme');
    const callsBefore = apiMock.list.mock.calls.length;
    service.clearFilters();
    expect(service.searchTerm()).toBe('');
    expect(service.filterStatus()).toBeUndefined();
    expect(apiMock.list.mock.calls.length).toBe(callsBefore + 1);
    expect(apiMock.list).toHaveBeenLastCalledWith({});
  });

  it('should load the detail and open the dialog when opening an order', () => {
    apiMock.getById.mockReturnValue(of(DETAIL));
    const service = createService();
    service.openDetail('o1');
    expect(apiMock.getById).toHaveBeenCalledWith('o1');
    expect(service.detail()).toEqual(DETAIL);
    expect(service.detailDialogVisible()).toBe(true);
  });

  it('should close the detail dialog', () => {
    const service = createService();
    service.detailDialogVisible.set(true);
    service.closeDetail();
    expect(service.detailDialogVisible()).toBe(false);
  });

  it('should confirm an order and reload the list on success', () => {
    apiMock.list.mockReturnValue(of(ORDERS));
    apiMock.confirm.mockReturnValue(of(void 0));
    const service = createService();
    const listCallsBefore = apiMock.list.mock.calls.length;
    service.confirmOrder('o1');
    expect(apiMock.confirm).toHaveBeenCalledWith('o1');
    expect(messageMock.add).toHaveBeenCalledWith(ORDERS_MESSAGES.confirmSuccess);
    expect(apiMock.list.mock.calls.length).toBe(listCallsBefore + 1);
  });

  it('should show an error toast when confirming an order fails', () => {
    apiMock.confirm.mockReturnValue(throwError(() => new Error('boom')));
    const service = createService();
    const listCallsBefore = apiMock.list.mock.calls.length;
    service.confirmOrder('o1');
    expect(messageMock.add).toHaveBeenCalledWith(ORDERS_MESSAGES.confirmError);
    expect(apiMock.list.mock.calls.length).toBe(listCallsBefore);
  });

  it('should cancel an order with the customer reason and reload the list on success', () => {
    apiMock.list.mockReturnValue(of(ORDERS));
    apiMock.cancel.mockReturnValue(of(void 0));
    const service = createService();
    const listCallsBefore = apiMock.list.mock.calls.length;
    service.cancelOrder('o1');
    expect(apiMock.cancel).toHaveBeenCalledWith('o1', 'Cancelado por el cliente');
    expect(messageMock.add).toHaveBeenCalledWith(ORDERS_MESSAGES.cancelSuccess);
    expect(apiMock.list.mock.calls.length).toBe(listCallsBefore + 1);
  });

  it('should show an error toast when cancelling an order fails', () => {
    apiMock.cancel.mockReturnValue(throwError(() => new Error('boom')));
    const service = createService();
    const listCallsBefore = apiMock.list.mock.calls.length;
    service.cancelOrder('o1');
    expect(messageMock.add).toHaveBeenCalledWith(ORDERS_MESSAGES.cancelError);
    expect(apiMock.list.mock.calls.length).toBe(listCallsBefore);
  });

  it('should show an error toast and keep the orders empty when the list fails', () => {
    apiMock.list.mockReturnValue(throwError(() => new Error('boom')));
    const service = createService();
    expect(messageMock.add).toHaveBeenCalledWith(ORDERS_MESSAGES.loadError);
    expect(service.loading()).toBe(false);
    expect(service.orders()).toEqual([]);
  });

  it('should show an error toast and keep the dialog closed when the detail fails', () => {
    apiMock.getById.mockReturnValue(throwError(() => new Error('boom')));
    const service = createService();
    service.openDetail('o1');
    expect(messageMock.add).toHaveBeenCalledWith(ORDERS_MESSAGES.detailError);
    expect(service.detail()).toBeNull();
    expect(service.detailDialogVisible()).toBe(false);
  });
});
