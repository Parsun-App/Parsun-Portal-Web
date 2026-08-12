import { Injectable, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import {
  Subject,
  Observable,
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { ProductsApiService } from '@features/products/services/api/products-api.service';
import { PortalProduct } from '@features/products/models';
import { PRODUCTS_MESSAGES } from '@features/products/messages/products.messages';
import type { PagedResponse } from '@shared/models';

const SEARCH_DEBOUNCE_MS = 300;
const CATEGORY_FETCH_SIZE = 100;
const EMPTY_PAGE: PagedResponse<PortalProduct> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 20,
  number: 0,
  first: true,
  last: true,
  empty: true,
};

interface CategoryOption {
  label: string;
  value: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly api = inject(ProductsApiService);
  private readonly messageService = inject(MessageService);

  readonly loading = signal(false);
  readonly products = signal<PortalProduct[]>([]);
  readonly totalElements = signal(0);
  readonly searchTerm = signal('');
  readonly selectedCategory = signal<string | null>(null);
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);
  readonly categoryOptions = signal<CategoryOption[]>([
    { label: 'Todas las categorías', value: null },
  ]);

  private categoriesLoaded = false;
  private readonly searchSubject = new Subject<string>();

  constructor() {
    this.loadCategories();
    this.searchSubject
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        tap(() => this.currentPage.set(0)),
        switchMap(() => this.loadProducts()),
      )
      .subscribe();
    this.loadProducts().subscribe();
  }

  loadCategories(): void {
    this.api
      .list(undefined, undefined, 0, CATEGORY_FETCH_SIZE)
      .pipe(
        tap((response) => {
          if (this.categoriesLoaded) return;
          const seen = new Set<string>();
          const options: CategoryOption[] = [{ label: 'Todas las categorías', value: null }];
          for (const product of response.content) {
            if (product.categoryId && !seen.has(product.categoryId)) {
              seen.add(product.categoryId);
              options.push({ label: product.categoryName, value: product.categoryId });
            }
          }
          this.categoryOptions.set(options);
          this.categoriesLoaded = true;
        }),
      )
      .subscribe();
  }

  searchChanged(term: string): void {
    this.searchTerm.set(term);
    this.searchSubject.next(term);
  }

  onCategoryChange(categoryId: string | null): void {
    this.selectedCategory.set(categoryId);
    this.currentPage.set(0);
    this.loadProducts().subscribe();
  }

  onPageChange(event: TablePageEvent): void {
    this.currentPage.set(Math.floor(event.first / event.rows));
    this.pageSize.set(event.rows);
    this.loadProducts().subscribe();
  }

  onGridPageChange(first: number, rows: number): void {
    this.currentPage.set(Math.floor(first / rows));
    this.pageSize.set(rows);
    this.loadProducts().subscribe();
  }

  downloadCatalog(): Observable<Blob> {
    return this.api.downloadCatalogPdf();
  }

  private loadProducts() {
    this.loading.set(true);
    return this.api
      .list(
        this.searchTerm() || undefined,
        this.selectedCategory() || undefined,
        this.currentPage(),
        this.pageSize(),
      )
      .pipe(
        tap((response) => {
          this.products.set(response.content);
          this.totalElements.set(response.totalElements);
          this.loading.set(false);
        }),
        catchError(() => {
          this.loading.set(false);
          this.messageService.add(PRODUCTS_MESSAGES.loadError);
          return of(EMPTY_PAGE);
        }),
      );
  }
}
