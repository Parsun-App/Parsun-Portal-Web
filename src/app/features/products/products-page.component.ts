import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { catchError, of, Subject, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { TablePageEvent } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProductsApiService } from './services/api/products-api.service';
import { PortalProduct } from '@shared/models';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    FormsModule, CurrencyPipe,
    InputTextModule, IconFieldModule, InputIconModule,
    SelectModule, TableModule, TagModule, DialogModule, ButtonModule,
    ProgressSpinnerModule, ToastModule, EmptyStateComponent,
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './products-page.component.html',
})
export class ProductsPageComponent {
  private readonly api = inject(ProductsApiService);
  private readonly messageService = inject(MessageService);

  readonly searchTerm = signal('');
  readonly selectedCategory = signal<string | null>(null);
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);
  readonly loading = signal(false);
  readonly selectedProduct = signal<PortalProduct | null>(null);
  readonly totalElements = signal(0);

  readonly dialogVisible = signal(false);

  readonly hasActiveFilters = computed(() => Boolean(this.searchTerm()) || Boolean(this.selectedCategory()));

  readonly emptyConfig = computed(() => {
    if (this.hasActiveFilters()) {
      return {
        icon: 'pi pi-box',
        title: 'Sin resultados',
        message: 'No encontramos resultados para tu búsqueda o filtros actuales.',
      };
    }
    return {
      icon: 'pi pi-box',
      title: 'No hay productos',
      message: 'Tus productos aparecerán aquí cuando los tengas.',
    };
  });

  readonly categoryOptions = signal<{ label: string; value: string | null }[]>([
    { label: 'Todas las categorías', value: null },
  ]);

  private categoriesLoaded = false;

  private readonly searchSubject = new Subject<string>();

  readonly products = signal<PortalProduct[]>([]);

  constructor() {
    this.loadCategories();
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.currentPage.set(0)),
      switchMap(() => this.loadProducts()),
    ).subscribe();
    this.loadProducts().subscribe();
  }

  private loadCategories(): void {
    this.api.list(undefined, undefined, 0, 100).pipe(
      tap(response => {
        if (this.categoriesLoaded) return;
        const seen = new Set<string>();
        const options: { label: string; value: string | null }[] = [
          { label: 'Todas las categorías', value: null },
        ];
        for (const p of response.content) {
          if (p.categoryId && !seen.has(p.categoryId)) {
            seen.add(p.categoryId);
            options.push({ label: p.categoryName, value: p.categoryId });
          }
        }
        this.categoryOptions.set(options);
        this.categoriesLoaded = true;
      }),
    ).subscribe();
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

  private loadProducts() {
    this.loading.set(true);
    return this.api.list(
      this.searchTerm() || undefined,
      this.selectedCategory() || undefined,
      this.currentPage(),
      this.pageSize()
    ).pipe(
      tap(response => {
        this.products.set(response.content);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      }),
      catchError(() => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los productos' });
        return of({ content: [], totalElements: 0, totalPages: 0, size: 20, number: 0, first: true, last: true, empty: true });
      }),
    );
  }
}
