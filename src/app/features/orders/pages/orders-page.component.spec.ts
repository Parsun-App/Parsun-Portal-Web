import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { OrdersPageComponent } from './orders-page.component';
import { OrdersService } from '@features/orders/services/application/orders.service';
import { PortalOrderList } from '@features/orders/models';

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

describe('OrdersPageComponent', () => {
  let fixture: ComponentFixture<OrdersPageComponent>;
  let component: OrdersPageComponent;
  let serviceMock: {
    loading: ReturnType<typeof signal<boolean>>;
    orders: ReturnType<typeof signal<PortalOrderList[]>>;
    detail: ReturnType<typeof signal<unknown | null>>;
    detailDialogVisible: ReturnType<typeof signal<boolean>>;
    searchTerm: ReturnType<typeof signal<string>>;
    filterStatus: ReturnType<typeof signal<string | undefined>>;
    onSearch: ReturnType<typeof vi.fn>;
    onStatusFilterChange: ReturnType<typeof vi.fn>;
    clearFilters: ReturnType<typeof vi.fn>;
    openDetail: ReturnType<typeof vi.fn>;
    confirmOrder: ReturnType<typeof vi.fn>;
    cancelOrder: ReturnType<typeof vi.fn>;
  };
  let confirmationMock: { confirm: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    serviceMock = {
      loading: signal(false),
      orders: signal<PortalOrderList[]>(ORDERS),
      detail: signal(null),
      detailDialogVisible: signal(false),
      searchTerm: signal(''),
      filterStatus: signal<string | undefined>(undefined),
      onSearch: vi.fn(),
      onStatusFilterChange: vi.fn(),
      clearFilters: vi.fn(),
      openDetail: vi.fn(),
      confirmOrder: vi.fn(),
      cancelOrder: vi.fn(),
    };
    confirmationMock = { confirm: vi.fn(), requireConfirmation$: of(null) };

    await TestBed.configureTestingModule({
      imports: [OrdersPageComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: OrdersService, useValue: serviceMock },
      ],
    })
      .overrideComponent(OrdersPageComponent, {
        set: { providers: [{ provide: ConfirmationService, useValue: confirmationMock }] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(OrdersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should forward the orders signal from the service', () => {
    expect(component.orders).toBe(serviceMock.orders);
  });

  it('should count active filters from search and status', () => {
    expect(component.activeFilterCount()).toBe(0);
    serviceMock.searchTerm.set('acme');
    expect(component.activeFilterCount()).toBe(1);
    serviceMock.filterStatus.set('DRAFT');
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
    component.onStatusFilterChange('DRAFT');
    expect(serviceMock.onStatusFilterChange).toHaveBeenCalledWith('DRAFT');
  });

  it('should delegate opening a detail to the service', () => {
    component.openDetail('o1');
    expect(serviceMock.openDetail).toHaveBeenCalledWith('o1');
  });

  it('should ask for confirmation before cancelling an order and delegate on accept', () => {
    component.cancelOrder('o1');
    expect(confirmationMock.confirm).toHaveBeenCalledTimes(1);
    const config = confirmationMock.confirm.mock.calls[0][0];
    config.accept?.();
    expect(serviceMock.cancelOrder).toHaveBeenCalledWith('o1');
  });

  it('should map draft orders to the info severity', () => {
    expect(component.statusSeverity('DRAFT')).toBe('info');
  });

  it('should map cancelled orders to the danger severity', () => {
    expect(component.statusSeverity('CANCELLED')).toBe('danger');
  });

  it('should use the plain empty state when there are no filters', () => {
    expect(component.emptyConfig().title).toBe('No hay pedidos');
  });

  it('should render the page title', () => {
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent.trim()).toBe('Pedidos');
  });
});
