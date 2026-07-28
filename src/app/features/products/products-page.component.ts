import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
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

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    FormsModule, CurrencyPipe,
    InputTextModule, IconFieldModule, InputIconModule,
    SelectModule, TableModule, TagModule, DialogModule, ButtonModule,
    ProgressSpinnerModule, ToastModule,
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-100">Productos</h1>
          <p class="text-surface-500 mt-1">Catálogo de productos disponibles.</p>
        </div>
      </div>

      <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-4 shadow-2xl mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <p-iconfield class="w-full sm:w-72">
            <p-inputicon class="pi pi-search" />
            <input
              pInputText
              [ngModel]="searchTerm()"
              (ngModelChange)="searchChanged($event)"
              placeholder="Buscar productos..."
              class="w-full"
            />
          </p-iconfield>
          <p-select
            [ngModel]="selectedCategory()"
            (ngModelChange)="onCategoryChange($event)"
            [options]="categoryOptions()"
            optionLabel="label"
            optionValue="value"
            placeholder="Todas las categorías"
            class="w-full sm:w-56"
            [showClear]="true"
          />
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <i class="pi pi-spin pi-spinner text-3xl text-surface-400"></i>
        </div>
      } @else if (products() && products()!.length === 0) {
        <div class="flex flex-col items-center justify-center h-64 text-surface-400 gap-3">
          <i class="pi pi-box text-4xl"></i>
          <p class="text-sm">No se encontraron productos</p>
        </div>
      } @else {
        <div class="rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden bg-surface-0 dark:bg-surface-900 shadow-2xl">
        <p-table
          [value]="products()"
          [paginator]="true"
          [rows]="pageSize()"
          [totalRecords]="totalElements()"
          [lazy]="true"
          (onPage)="onPageChange($event)"
          [rowsPerPageOptions]="[10, 20, 50]"
          styleClass="w-full"
          [rowHover]="true"
          dataKey="id"
        >
          <ng-template pTemplate="header">
            <tr class="border-b border-surface-200 dark:border-surface-700">
              <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Código</th>
              <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Nombre</th>
              <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Categoría</th>
              <th class="text-right px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Precio</th>
              <th class="text-center px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Stock</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-product>
            <tr
              class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer"
              (click)="selectedProduct.set(product)"
            >
              <td class="px-4 py-3 font-mono text-sm text-surface-700 dark:text-surface-300">{{ product.code }}</td>
              <td class="px-4 py-3 font-medium text-surface-900 dark:text-surface-100">{{ product.name }}</td>
              <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-400">{{ product.categoryName }}</td>
              <td class="px-4 py-3 text-right font-medium tabular-nums">{{ product.price | currency:'USD':'symbol' }}</td>
              <td class="px-4 py-3 text-center">
                @if (product.availableStock > 0) {
                  <p-tag value="{{ product.availableStock }}" severity="success" />
                } @else {
                  <p-tag value="Agotado" severity="danger" />
                }
              </td>
            </tr>
          </ng-template>
        </p-table>
        </div>
      }
    </div>

    <p-dialog
      [(visible)]="dialogVisible"
      [style]="{ width: '32rem' }"
      [modal]="true"
      [closable]="true"
    >
      <ng-template pTemplate="header">
        <div class="flex items-center gap-3">
          <i class="pi pi-box text-xl text-surface-500"></i>
          <span class="text-lg font-semibold text-surface-900 dark:text-surface-100">{{ selectedProduct()?.name }}</span>
        </div>
      </ng-template>
      @if (selectedProduct(); as p) {
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Código</label>
              <p class="text-sm font-mono mt-1 text-surface-900 dark:text-surface-100">{{ p.code }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Categoría</label>
              <p class="text-sm mt-1 text-surface-900 dark:text-surface-100">{{ p.categoryName }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Precio</label>
              <p class="text-sm font-medium mt-1 text-surface-900 dark:text-surface-100">{{ p.price | currency:'USD':'symbol' }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Stock Disponible</label>
              <p class="text-sm mt-1">
                @if (p.availableStock > 0) {
                  <span class="text-green-600 dark:text-green-400 font-medium">{{ p.availableStock }} unidades</span>
                } @else {
                  <span class="text-red-600 dark:text-red-400 font-medium">Agotado</span>
                }
              </p>
            </div>
          </div>
          @if (p.description) {
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Descripción</label>
              <p class="text-sm mt-1 text-surface-700 dark:text-surface-300">{{ p.description }}</p>
            </div>
          }
          <div>
            <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Estado</label>
            <p class="text-sm mt-1">
              @if (p.active) {
                <span class="text-green-600 dark:text-green-400">Activo</span>
              } @else {
                <span class="text-red-600 dark:text-red-400">Inactivo</span>
              }
            </p>
          </div>
        </div>
      }
      <ng-template pTemplate="footer">
        <p-button label="Cerrar" (click)="dialogVisible.set(false)" severity="secondary" [text]="true" />
      </ng-template>
    </p-dialog>

    <p-toast />
  `,
})
export class ProductsPageComponent {
  private readonly api = inject(ProductsApiService);

  readonly searchTerm = signal('');
  readonly selectedCategory = signal<string | null>(null);
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);
  readonly loading = signal(false);
  readonly selectedProduct = signal<PortalProduct | null>(null);
  readonly totalElements = signal(0);

  readonly dialogVisible = signal(false);

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
        return of({ content: [], totalElements: 0, totalPages: 0, size: 20, number: 0, first: true, last: true, empty: true });
      }),
    );
  }
}
