import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProductsService } from '@features/products/services/application/products.service';
import { PortalProduct } from '@features/products/models';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { PageHeaderComponent, SearchFieldComponent } from '@shared/components/ui';
import { ListActionButtonsComponent, type ListAction } from '@shared/components/list';
import { ProductDetailDialogComponent } from '@features/products/components/product-detail-dialog/product-detail-dialog.component';
import { PdfViewerDialogComponent, PdfViewerService } from '@core/pdf-viewer';
import { environment } from '@env/environment';

type ViewMode = 'table' | 'grid';

const VIEW_MODE_STORAGE_KEY = 'parsun-products-view-mode';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    FormsModule,
    CurrencyPipe,
    SelectModule,
    TableModule,
    TagModule,
    DialogModule,
    ButtonModule,
    ImageModule,
    TooltipModule,
    PaginatorModule,
    EmptyStateComponent,
    PageHeaderComponent,
    SearchFieldComponent,
    ListActionButtonsComponent,
    ProductDetailDialogComponent,
    PdfViewerDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './products-page.component.html',
})
export class ProductsPageComponent implements OnInit, OnDestroy {
  private readonly productsService = inject(ProductsService);
  private readonly pdfViewerService = inject(PdfViewerService);

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

  readonly isMobile = signal(false);
  private readonly mediaQuery = window.matchMedia('(max-width: 767px)');

  readonly hasActiveFilters = computed(
    () => Boolean(this.searchTerm()) || Boolean(this.selectedCategory()),
  );
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
    this.productsService.load();
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (stored === 'grid' || stored === 'table') {
      this.viewMode.set(stored);
    }
    this.isMobile.set(this.mediaQuery.matches);
    this.mediaQuery.addEventListener('change', this.onMediaChange);
  }

  ngOnDestroy(): void {
    this.mediaQuery.removeEventListener('change', this.onMediaChange);
  }

  private readonly onMediaChange = (e: MediaQueryListEvent): void => {
    this.isMobile.set(e.matches);
  };

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

  actionsFor(product: PortalProduct): ListAction[] {
    return [{ label: 'Ver detalle', icon: 'pi pi-eye', command: () => this.openDetail(product) }];
  }

  downloadCatalog(): void {
    this.pdfViewerService.open({
      url: `${environment.apiUrl}/portal/products/catalog/pdf`,
      title: 'Cat&aacute;logo Comercial',
      fileName: 'catalogo-comercial.pdf',
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

  onMobilePageChange(event: PaginatorState): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    this.productsService.onGridPageChange(first, rows);
  }

  onGridPageChange(event: PaginatorState): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    this.productsService.onGridPageChange(first, rows);
  }
}
