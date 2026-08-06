import { Component, inject, computed, ChangeDetectionStrategy, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PopoverModule } from 'primeng/popover';
import { TextareaModule } from 'primeng/textarea';
import { QuotesService } from '@features/quotes/services/application/quotes.service';
import { ProductsApiService } from '@features/products/services/api/products-api.service';
import { PortalProduct } from '@features/products/models';
import { getStatusLabel } from '@shared/utils/status-labels';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { QUOTES_MESSAGES } from '@features/quotes/messages/quotes.messages';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

interface DraftLine {
  product: PortalProduct | null;
  quantity: number;
  unitPrice: number;
}

const PRODUCTS_FETCH_SIZE = 100;

@Component({
  selector: 'app-quotes-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, TableModule, TagModule, DialogModule, ButtonModule, TooltipModule, IconFieldModule, InputIconModule, InputTextModule, SelectModule, PopoverModule, TextareaModule, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quotes-page.component.html',
})
export class QuotesPageComponent {
  private readonly quotesService = inject(QuotesService);
  private readonly productsApi = inject(ProductsApiService);

  readonly loading = this.quotesService.loading;
  readonly quotes = this.quotesService.quotes;
  readonly detail = this.quotesService.detail;
  readonly detailDialogVisible = this.quotesService.detailDialogVisible;
  readonly createDialogVisible = this.quotesService.createDialogVisible;
  readonly creating = this.quotesService.creating;
  readonly searchTerm = this.quotesService.searchTerm;
  readonly filterStatus = this.quotesService.filterStatus;

  readonly products = signal<PortalProduct[]>([]);
  readonly productOptionsLoading = signal(false);
  readonly lines = signal<DraftLine[]>([this.emptyLine()]);
  readonly notes = signal('');

  readonly draftTotal = computed(() =>
    this.lines().reduce((acc, line) => acc + (line.product ? line.quantity * line.unitPrice : 0), 0),
  );

  readonly canSubmit = computed(() => {
    const hasLines = this.lines().some(line => line.product !== null && line.quantity > 0 && line.unitPrice > 0);
    return hasLines && !this.creating();
  });

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.searchTerm()) count++;
    if (this.filterStatus()) count++;
    return count;
  });

  readonly hasActiveFilters = computed(() => Boolean(this.searchTerm()) || Boolean(this.filterStatus()));

  readonly emptyConfig = computed(() => {
    if (this.hasActiveFilters()) {
      return {
        icon: 'pi pi-file-edit',
        title: 'Sin resultados',
        message: 'No encontramos resultados para tu búsqueda o filtros actuales.',
      };
    }
    return {
      icon: 'pi pi-file-edit',
      title: 'No hay presupuestos',
      message: 'Tus presupuestos aparecerán aquí cuando los tengas.',
    };
  });

  readonly statusOptions = [
    { label: 'Borrador', value: 'DRAFT' },
    { label: 'Borrador por Cliente', value: 'CUSTOMER_DRAFT' },
    { label: 'Enviado', value: 'SENT' },
    { label: 'Convertido', value: 'CONVERTED' },
    { label: 'Cancelado', value: 'CANCELLED' },
    { label: 'Vencido', value: 'EXPIRED' },
  ];

  readonly getStatusLabel = getStatusLabel;

  onSearch(value: string): void {
    this.quotesService.onSearch(value);
  }

  onStatusFilterChange(value: string | null): void {
    this.quotesService.onStatusFilterChange(value);
  }

  clearFilters(): void {
    this.quotesService.clearFilters();
  }

  openDetail(id: string): void {
    this.quotesService.openDetail(id);
  }

  statusSeverity(status: string): StatusSeverity {
    const map: Record<string, StatusSeverity> = {
      DRAFT: 'info',
      CUSTOMER_DRAFT: 'warn',
      SENT: 'info',
      CONVERTED: 'success',
      CANCELLED: 'danger',
      EXPIRED: 'warn',
    };
    return map[status] ?? 'info';
  }

  openCreateDialog(): void {
    this.loadProductOptions();
    this.resetDraft();
    this.quotesService.openCreateDialog();
  }

  closeCreateDialog(): void {
    this.quotesService.closeCreateDialog();
  }

  addLine(): void {
    this.lines.update(lines => [...lines, this.emptyLine()]);
  }

  removeLine(index: number): void {
    this.lines.update(lines => lines.filter((_, i) => i !== index));
  }

  updateLineProduct(index: number, product: PortalProduct | null): void {
    if (product && this.isProductUsedInOtherLine(index, product.id)) {
      this.quotesService.notify(QUOTES_MESSAGES.duplicateProductError);
      return;
    }
    this.lines.update(lines => lines.map((line, i) =>
      i === index ? { ...line, product, unitPrice: product ? product.price : line.unitPrice } : line,
    ));
  }

  availableProductsForLine(index: number): PortalProduct[] {
    const usedIds = new Set(
      this.lines()
        .filter((_, i) => i !== index)
        .map(line => line.product?.id)
        .filter((id): id is string => Boolean(id)),
    );
    return this.products().filter(product => !usedIds.has(product.id));
  }

  private isProductUsedInOtherLine(index: number, productId: string): boolean {
    return this.lines().some((line, i) => i !== index && line.product?.id === productId);
  }

  updateLineQuantity(index: number, quantity: number | null): void {
    this.lines.update(lines => lines.map((line, i) =>
      i === index ? { ...line, quantity: quantity ?? 0 } : line,
    ));
  }

  lineTotal(line: DraftLine): number {
    return line.product ? line.quantity * line.unitPrice : 0;
  }

  submit(): void {
    if (!this.canSubmit()) {
      this.quotesService.notify(QUOTES_MESSAGES.validationError);
      return;
    }
    const request = {
      lines: this.lines()
        .filter(line => line.product !== null && line.quantity > 0 && line.unitPrice > 0)
        .map(line => ({
          productId: line.product!.id,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
      notes: this.notes().trim() || undefined,
    };
    this.quotesService.create(request);
  }

  private emptyLine(): DraftLine {
    return { product: null, quantity: 1, unitPrice: 0 };
  }

  private resetDraft(): void {
    this.lines.set([this.emptyLine()]);
    this.notes.set('');
  }

  private loadProductOptions(): void {
    this.productOptionsLoading.set(true);
    this.productsApi.list(undefined, undefined, 0, PRODUCTS_FETCH_SIZE).subscribe({
      next: response => {
        this.products.set(response.content);
        this.productOptionsLoading.set(false);
      },
      error: () => {
        this.productOptionsLoading.set(false);
        this.quotesService.notify(QUOTES_MESSAGES.productsLoadError);
      },
    });
  }
}
