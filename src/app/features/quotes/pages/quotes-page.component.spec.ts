import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { Subject, of } from 'rxjs';
import { QuotesPageComponent } from './quotes-page.component';
import { QuotesService } from '@features/quotes/services/application/quotes.service';
import { ProductsApiService } from '@features/products/services/api/products-api.service';
import { PortalQuoteList, PortalQuoteDetail } from '@features/quotes/models';
import { PortalProduct } from '@features/products/models';
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

const PRODUCTS: PortalProduct[] = [
  {
    id: 'p1',
    code: 'PROD-001',
    name: 'Mesa Roble',
    description: 'Mesa de roble',
    categoryId: 'c1',
    categoryName: 'Muebles',
    active: true,
    photo: null,
    price: 500,
    availableStock: 12,
  },
  {
    id: 'p2',
    code: 'PROD-002',
    name: 'Silla Oficina',
    description: 'Silla ergonómica',
    categoryId: 'c2',
    categoryName: 'Muebles',
    active: true,
    photo: null,
    price: 120,
    availableStock: 8,
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
    createDialogVisible: ReturnType<typeof signal<boolean>>;
    creating: ReturnType<typeof signal<boolean>>;
    searchTerm: ReturnType<typeof signal<string>>;
    dateFrom: ReturnType<typeof signal<string>>;
    dateTo: ReturnType<typeof signal<string>>;
    filterStatus: ReturnType<typeof signal<string | undefined>>;
    onSearch: ReturnType<typeof vi.fn>;
    onDateFilterChange: ReturnType<typeof vi.fn>;
    onStatusFilterChange: ReturnType<typeof vi.fn>;
    clearFilters: ReturnType<typeof vi.fn>;
    openDetail: ReturnType<typeof vi.fn>;
    openCreateDialog: ReturnType<typeof vi.fn>;
    closeCreateDialog: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    notify: ReturnType<typeof vi.fn>;
    createDialogRequested$: Subject<void>;
  };
  let productsApiMock: { list: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    serviceMock = {
      loading: signal(false),
      quotes: signal<PortalQuoteList[]>(QUOTES),
      detail: signal(null),
      detailDialogVisible: signal(false),
      createDialogVisible: signal(false),
      creating: signal(false),
      searchTerm: signal(''),
      dateFrom: signal(''),
      dateTo: signal(''),
      filterStatus: signal<string | undefined>(undefined),
      onSearch: vi.fn(),
      onDateFilterChange: vi.fn(),
      onStatusFilterChange: vi.fn(),
      clearFilters: vi.fn(),
      openDetail: vi.fn(),
      openCreateDialog: vi.fn(),
      closeCreateDialog: vi.fn(),
      create: vi.fn(),
      notify: vi.fn(),
      createDialogRequested$: new Subject<void>(),
    };
    productsApiMock = { list: vi.fn().mockReturnValue(of({ content: PRODUCTS, totalElements: 1, totalPages: 1, size: 100, number: 0, first: true, last: true, empty: false })) };

    await TestBed.configureTestingModule({
      imports: [QuotesPageComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: QuotesService, useValue: serviceMock },
        { provide: ProductsApiService, useValue: productsApiMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuotesPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
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

  it('should consume focus once and preserve the collection when opening a detail', async () => {
    await router.navigateByUrl('/?focus=q1');

    expect(serviceMock.openDetail).toHaveBeenCalledWith('q1');
  });

  it('should not reopen while cleanup runs and should reopen for a later focus link', async () => {
    await router.navigateByUrl('/?focus=q1');
    await fixture.whenStable();

    expect(serviceMock.openDetail).toHaveBeenCalledTimes(1);

    await router.navigateByUrl('/?focus=q1');
    await fixture.whenStable();

    expect(serviceMock.openDetail).toHaveBeenCalledTimes(2);
  });

  it('should clear focus with replaceUrl while preserving unrelated query parameters', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(false);

    await expect(component.clearFocus()).resolves.toBeUndefined();

    expect(navigate).toHaveBeenCalledWith([], expect.objectContaining({
      queryParams: { focus: null }, queryParamsHandling: 'merge', replaceUrl: true,
    }));
  });

  it('should close the detail and safely absorb a rejected focus cleanup', async () => {
    vi.spyOn(router, 'navigate').mockRejectedValue(new Error('navigation failed'));
    component.detailDialogVisible.set(true);

    await expect(component.clearFocus()).resolves.toBeUndefined();
    component.closeDetail();

    expect(component.detailDialogVisible()).toBe(false);
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

  it('should map customer draft quotes to the warn severity', () => {
    expect(component.statusSeverity('CUSTOMER_DRAFT')).toBe('warn');
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

  it('should open the create dialog and load product options', () => {
    component.openCreateDialog();
    expect(serviceMock.openCreateDialog).toHaveBeenCalledTimes(1);
    expect(productsApiMock.list).toHaveBeenCalledWith(undefined, undefined, 0, 100);
    expect(component.products().length).toBe(2);
    expect(component.lines().length).toBe(1);
  });

  it('should reset the draft when opening the create dialog', () => {
    component.lines.set([component['emptyLine'](), component['emptyLine']()]);
    component.notes.set('urgente');
    component.openCreateDialog();
    expect(component.lines().length).toBe(1);
    expect(component.notes()).toBe('');
  });

  it('should add and remove draft lines', () => {
    component.addLine();
    expect(component.lines().length).toBe(2);
    component.removeLine(0);
    expect(component.lines().length).toBe(1);
  });

  it('should autofill the unit price when a product is selected', () => {
    component.updateLineProduct(0, PRODUCTS[0]);
    const line = component.lines()[0];
    expect(line.product?.id).toBe('p1');
    expect(line.unitPrice).toBe(500);
  });

  it('should not allow the same product in more than one line', () => {
    component.updateLineProduct(0, PRODUCTS[0]);
    component.addLine();
    component.updateLineProduct(1, PRODUCTS[0]);
    expect(component.lines()[1].product).toBeNull();
    expect(serviceMock.notify).toHaveBeenCalledWith(QUOTES_MESSAGES.duplicateProductError);
  });

  it('should allow a different product in another line', () => {
    component.updateLineProduct(0, PRODUCTS[0]);
    component.addLine();
    component.updateLineProduct(1, PRODUCTS[1]);
    expect(component.lines()[1].product?.id).toBe('p2');
    expect(component.lines()[1].unitPrice).toBe(120);
  });

  it('should filter out products already used in other lines', () => {
    component.products.set(PRODUCTS);
    component.updateLineProduct(0, PRODUCTS[0]);
    component.addLine();
    const availableForSecond = component.availableProductsForLine(1);
    expect(availableForSecond.map(p => p.id)).toEqual(['p2']);
    const availableForFirst = component.availableProductsForLine(0);
    expect(availableForFirst.map(p => p.id)).toEqual(['p1', 'p2']);
  });

  it('should compute the draft total from the lines', () => {
    component.updateLineProduct(0, PRODUCTS[0]);
    component.updateLineQuantity(0, 2);
    expect(component.draftTotal()).toBe(1000);
    component.addLine();
    component.updateLineProduct(1, PRODUCTS[1]);
    component.updateLineQuantity(1, 1);
    expect(component.draftTotal()).toBe(1120);
  });

  it('should disable submit until a line is complete', () => {
    expect(component.canSubmit()).toBe(false);
    component.updateLineProduct(0, PRODUCTS[0]);
    expect(component.canSubmit()).toBe(true);
  });

  it('should submit the request to the service', () => {
    component.updateLineProduct(0, PRODUCTS[0]);
    component.updateLineQuantity(0, 3);
    component.notes.set('  urgente  ');
    component.submit();
    expect(serviceMock.create).toHaveBeenCalledWith({
      lines: [{ productId: 'p1', quantity: 3, unitPrice: 500 }],
      notes: 'urgente',
    });
  });

  it('should notify a validation warning when submitting an incomplete draft', () => {
    component.submit();
    expect(serviceMock.notify).toHaveBeenCalledWith(QUOTES_MESSAGES.validationError);
    expect(serviceMock.create).not.toHaveBeenCalled();
  });
});
