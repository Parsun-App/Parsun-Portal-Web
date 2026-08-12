import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { MessageService } from 'primeng/api';
import type { TablePageEvent } from 'primeng/table';
import { ProductsService } from '@features/products/services/application/products.service';
import { ProductsApiService } from '@features/products/services/api/products-api.service';
import { PortalProduct } from '@features/products/models';
import { PRODUCTS_MESSAGES } from '@features/products/messages/products.messages';
import type { PagedResponse } from '@shared/models';

const PRODUCTS: PortalProduct[] = [
  {
    id: 'p1',
    code: 'PROD-001',
    name: 'Mesa Roble',
    description: 'Mesa de roble macizo',
    categoryId: 'c1',
    categoryName: 'Muebles',
    active: true,
    photo: null,
    price: 250,
    availableStock: 8,
  },
  {
    id: 'p2',
    code: 'PROD-002',
    name: 'Silla Ergonómica',
    description: 'Silla de oficina',
    categoryId: 'c1',
    categoryName: 'Muebles',
    active: true,
    photo: null,
    price: 90,
    availableStock: 0,
  },
  {
    id: 'p3',
    code: 'PROD-003',
    name: 'Lámpara LED',
    description: 'Lámpara de escritorio',
    categoryId: 'c2',
    categoryName: 'Iluminación',
    active: false,
    photo: null,
    price: 45,
    availableStock: 12,
  },
];

const CATEGORY_PAGE: PagedResponse<PortalProduct> = {
  content: PRODUCTS,
  totalElements: 3,
  totalPages: 1,
  size: 100,
  number: 0,
  first: true,
  last: true,
  empty: false,
};

const PAGE: PagedResponse<PortalProduct> = {
  content: PRODUCTS,
  totalElements: 3,
  totalPages: 1,
  size: 20,
  number: 0,
  first: true,
  last: true,
  empty: false,
};

describe('ProductsService', () => {
  let apiMock: { list: ReturnType<typeof vi.fn> };
  let messageMock: { add: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    apiMock = { list: vi.fn().mockReturnValue(of(PAGE)) };
    messageMock = { add: vi.fn() };
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  function createService(): ProductsService {
    TestBed.configureTestingModule({
      providers: [
        { provide: ProductsApiService, useValue: apiMock },
        { provide: MessageService, useValue: messageMock },
      ],
    });
    return TestBed.inject(ProductsService);
  }

  it('should load products on construction and populate the products and totalElements signals', () => {
    apiMock.list.mockReturnValue(of(PAGE));
    const service = createService();
    expect(service.products()).toEqual(PAGE.content);
    expect(service.totalElements()).toBe(PAGE.totalElements);
    expect(service.loading()).toBe(false);
  });

  it('should set loading true while the products request is pending', () => {
    const pending = new Subject<PagedResponse<PortalProduct>>();
    apiMock.list.mockImplementation((_search, _categoryId, _page, size = 20) =>
      size === 100 ? of(CATEGORY_PAGE) : pending.asObservable(),
    );
    const service = createService();
    expect(service.loading()).toBe(true);
    pending.next(PAGE);
    pending.complete();
    expect(service.loading()).toBe(false);
  });

  it('should debounce search and reload products after 300ms', () => {
    apiMock.list.mockReturnValue(of(PAGE));
    const service = createService();
    vi.useFakeTimers();
    const callsBefore = apiMock.list.mock.calls.length;
    service.searchChanged('mesa');
    expect(apiMock.list.mock.calls.length).toBe(callsBefore);
    vi.advanceTimersByTime(299);
    expect(apiMock.list.mock.calls.length).toBe(callsBefore);
    vi.advanceTimersByTime(1);
    expect(apiMock.list.mock.calls.length).toBe(callsBefore + 1);
    expect(service.currentPage()).toBe(0);
  });

  it('should update the search term signal when the search changes', () => {
    apiMock.list.mockReturnValue(of(PAGE));
    const service = createService();
    service.searchChanged('mesa');
    expect(service.searchTerm()).toBe('mesa');
  });

  it('should reset the page and reload when the category changes', () => {
    apiMock.list.mockReturnValue(of(PAGE));
    const service = createService();
    service.currentPage.set(2);
    service.onCategoryChange('c1');
    expect(service.selectedCategory()).toBe('c1');
    expect(service.currentPage()).toBe(0);
    expect(apiMock.list).toHaveBeenLastCalledWith(undefined, 'c1', 0, 20);
  });

  it('should derive the current page from the table page event', () => {
    apiMock.list.mockReturnValue(of(PAGE));
    const service = createService();
    service.onPageChange({ first: 20, rows: 10 } as TablePageEvent);
    expect(service.currentPage()).toBe(2);
    expect(service.pageSize()).toBe(10);
    expect(apiMock.list).toHaveBeenLastCalledWith(undefined, undefined, 2, 10);
  });

  it('should build category options from the first list response', () => {
    apiMock.list.mockReturnValue(of(CATEGORY_PAGE));
    const service = createService();
    expect(service.categoryOptions()).toEqual([
      { label: 'Todas las categorías', value: null },
      { label: 'Muebles', value: 'c1' },
      { label: 'Iluminación', value: 'c2' },
    ]);
  });

  it('should show an error toast and keep the products empty when the list fails', () => {
    apiMock.list.mockImplementation((_search, _categoryId, _page, size = 20) =>
      size === 100 ? of(CATEGORY_PAGE) : throwError(() => new Error('boom')),
    );
    const service = createService();
    expect(messageMock.add).toHaveBeenCalledWith(PRODUCTS_MESSAGES.loadError);
    expect(service.loading()).toBe(false);
    expect(service.products()).toEqual([]);
    expect(service.totalElements()).toBe(0);
  });
});
