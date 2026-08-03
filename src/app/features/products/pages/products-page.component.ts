import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
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
import { ProductsService } from '@features/products/services/application/products.service';
import { PortalProduct } from '@features/products/models';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    FormsModule, CurrencyPipe,
    InputTextModule, IconFieldModule, InputIconModule,
    SelectModule, TableModule, TagModule, DialogModule, ButtonModule,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './products-page.component.html',
})
export class ProductsPageComponent {
  private readonly productsService = inject(ProductsService);

  readonly loading = this.productsService.loading;
  readonly products = this.productsService.products;
  readonly totalElements = this.productsService.totalElements;
  readonly searchTerm = this.productsService.searchTerm;
  readonly selectedCategory = this.productsService.selectedCategory;
  readonly categoryOptions = this.productsService.categoryOptions;
  readonly pageSize = this.productsService.pageSize;

  readonly selectedProduct = signal<PortalProduct | null>(null);
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

  searchChanged(term: string): void {
    this.productsService.searchChanged(term);
  }

  onCategoryChange(categoryId: string | null): void {
    this.productsService.onCategoryChange(categoryId);
  }

  onPageChange(event: TablePageEvent): void {
    this.productsService.onPageChange(event);
  }
}
