import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { MessageService } from 'primeng/api';
import { ProductsService } from '@features/products/services/application/products.service';
import { PortalProduct } from '@features/products/models';
import { PRODUCTS_MESSAGES } from '@features/products/messages/products.messages';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { environment } from '@env/environment';

type ViewMode = 'table' | 'grid';

const VIEW_MODE_STORAGE_KEY = 'parsun-products-view-mode';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    FormsModule, CurrencyPipe,
    InputTextModule, IconFieldModule, InputIconModule,
    SelectModule, TableModule, TagModule, DialogModule, ButtonModule,
    ImageModule, TooltipModule, PaginatorModule,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './products-page.component.html',
})
export class ProductsPageComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly messageService = inject(MessageService);

  readonly loading = this.productsService.loading;
  readonly products = this.productsService.products;
  readonly totalElements = this.productsService.totalElements;
  readonly searchTerm = this.productsService.searchTerm;
  readonly selectedCategory = this.productsService.selectedCategory;
  readonly categoryOptions = this.productsService.categoryOptions;
  readonly pageSize = this.productsService.pageSize;
  readonly currentPage = this.productsService.currentPage;

  readonly selectedProduct = signal<PortalProduct | null>(null);
  readonly dialogVisible = signal(false);
  readonly viewMode = signal<ViewMode>('grid');
  readonly downloadingCatalog = signal(false);

  readonly hasActiveFilters = computed(() => Boolean(this.searchTerm()) || Boolean(this.selectedCategory()));
  readonly isGridView = computed(() => this.viewMode() === 'grid');

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

  ngOnInit(): void {
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (stored === 'grid' || stored === 'table') {
      this.viewMode.set(stored);
    }
  }

  buildPhotoUrl(photo: string | null): string | null {
    if (!photo) return null;
    return `/api/files/${photo}`;
  }

  toggleView(): void {
    const next = this.viewMode() === 'table' ? 'grid' : 'table';
    this.viewMode.set(next);
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, next);
  }

  openDetail(product: PortalProduct): void {
    this.selectedProduct.set(product);
    this.dialogVisible.set(true);
  }

  downloadCatalog(): void {
    this.downloadingCatalog.set(true);
    this.productsService.downloadCatalog().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'catalogo-comercial.pdf';
        anchor.click();
        window.URL.revokeObjectURL(url);
        this.downloadingCatalog.set(false);
      },
      error: () => {
        this.downloadingCatalog.set(false);
        this.messageService.add(PRODUCTS_MESSAGES.catalogDownloadError);
      },
    });
  }

  searchChanged(term: string): void {
    this.productsService.searchChanged(term);
  }

  onCategoryChange(categoryId: string | null): void {
    this.productsService.onCategoryChange(categoryId);
  }

  onPageChange(event: TablePageEvent): void {
    this.productsService.onPageChange(event);
  }

  onGridPageChange(event: PaginatorState): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    this.productsService.onGridPageChange(first, rows);
  }
}
