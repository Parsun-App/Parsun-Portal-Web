import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import type { TablePageEvent, PaginatorState } from 'primeng/table';
import { ProductsPageComponent } from '@features/products/pages/products-page.component';
import { ProductsService } from '@features/products/services/application/products.service';
import { PortalProduct } from '@features/products/models';
import { SearchFieldComponent } from '@shared/components/ui';

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
];

describe('ProductsPageComponent', () => {
  let fixture: ComponentFixture<ProductsPageComponent>;
  let component: ProductsPageComponent;
  let serviceMock: {
    loading: ReturnType<typeof signal<boolean>>;
    products: ReturnType<typeof signal<PortalProduct[]>>;
    totalElements: ReturnType<typeof signal<number>>;
    searchTerm: ReturnType<typeof signal<string>>;
    selectedCategory: ReturnType<typeof signal<string | null>>;
    categoryOptions: ReturnType<typeof signal<{ label: string; value: string | null }[]>>;
    pageSize: ReturnType<typeof signal<number>>;
    currentPage: ReturnType<typeof signal<number>>;
    load: ReturnType<typeof vi.fn>;
    searchChanged: ReturnType<typeof vi.fn>;
    onCategoryChange: ReturnType<typeof vi.fn>;
    onPageChange: ReturnType<typeof vi.fn>;
    onGridPageChange: ReturnType<typeof vi.fn>;
    downloadCatalog: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    serviceMock = {
      loading: signal(false),
      products: signal<PortalProduct[]>(PRODUCTS),
      totalElements: signal(PRODUCTS.length),
      searchTerm: signal(''),
      selectedCategory: signal<string | null>(null),
      categoryOptions: signal([{ label: 'Todas las categorías', value: null }]),
      pageSize: signal(20),
      currentPage: signal(0),
      load: vi.fn(),
      searchChanged: vi.fn(),
      onCategoryChange: vi.fn(),
      onPageChange: vi.fn(),
      onGridPageChange: vi.fn(),
      downloadCatalog: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductsPageComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ProductsService, useValue: serviceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should forward the products signal from the service', () => {
    expect(component.products).toBe(serviceMock.products);
  });

  it('should forward the total elements signal from the service', () => {
    expect(component.totalElements).toBe(serviceMock.totalElements);
  });

  it('should delegate search changes to the service', () => {
    component.searchChanged('mesa');
    expect(serviceMock.searchChanged).toHaveBeenCalledWith('mesa');
  });

  it('should use the shared explicit search field', () => {
    const searchField = fixture.debugElement.queryAll(By.directive(SearchFieldComponent));

    expect(searchField).toHaveLength(1);
  });

  it('should delegate category changes to the service', () => {
    component.onCategoryChange('c1');
    expect(serviceMock.onCategoryChange).toHaveBeenCalledWith('c1');
  });

  it('should delegate page changes to the service', () => {
    const event = { first: 20, rows: 10 } as TablePageEvent;
    component.onPageChange(event);
    expect(serviceMock.onPageChange).toHaveBeenCalledWith(event);
  });

  it('should report active filters when the search term or category is set', () => {
    expect(component.hasActiveFilters()).toBe(false);
    serviceMock.searchTerm.set('mesa');
    expect(component.hasActiveFilters()).toBe(true);
  });

  it('should use the filtered empty state when filters are active', () => {
    serviceMock.searchTerm.set('mesa');
    expect(component.emptyConfig().title).toBe('Sin resultados');
  });

  it('should use the plain empty state when there are no filters', () => {
    expect(component.emptyConfig().title).toBe('No hay productos');
  });

  it('should render the page title', () => {
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent.trim()).toBe('Productos');
  });

  it('should render the filtered empty state title in the template', () => {
    serviceMock.products.set([]);
    serviceMock.searchTerm.set('mesa');
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h3');
    expect(title.textContent.trim()).toBe('Sin resultados');
  });

  it('should default to grid view mode', () => {
    expect(component.viewMode()).toBe('grid');
  });

  it('should toggle between table and grid views', () => {
    expect(component.viewMode()).toBe('grid');
    component.toggleView();
    expect(component.viewMode()).toBe('table');
    component.toggleView();
    expect(component.viewMode()).toBe('grid');
  });
});
