import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { PopoverModule } from 'primeng/popover';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ConfirmationService } from 'primeng/api';
import { QuotesService } from '@features/quotes/services/application/quotes.service';
import { ProductsApiService } from '@features/products/services/api/products-api.service';
import { PortalProduct } from '@features/products/models';
import { getStatusLabel } from '@shared/utils/status-labels';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { QUOTES_MESSAGES } from '@features/quotes/messages/quotes.messages';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

interface FormLine {
  product: PortalProduct | null;
  quantity: number;
  unitPrice: number;
}

@Component({
  selector: 'app-quotes-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, TableModule, TagModule, DialogModule, ButtonModule,
            ConfirmDialogModule, TooltipModule, IconFieldModule, InputIconModule, InputTextModule, InputNumberModule,
            TextareaModule, SelectModule, PopoverModule, AutoCompleteModule, EmptyStateComponent],
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quotes-page.component.html',
})
export class QuotesPageComponent {
  private readonly quotesService = inject(QuotesService);
  private readonly productsApi = inject(ProductsApiService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly loading = this.quotesService.loading;
  readonly creating = this.quotesService.creating;
  readonly quotes = this.quotesService.quotes;
  readonly detail = this.quotesService.detail;
  readonly detailDialogVisible = this.quotesService.detailDialogVisible;
  readonly createDialogVisible = this.quotesService.createDialogVisible;
  readonly searchTerm = this.quotesService.searchTerm;
  readonly filterStatus = this.quotesService.filterStatus;

  readonly products = signal<PortalProduct[]>([]);
  readonly filteredSuggestions = signal<PortalProduct[]>([]);
  readonly notes = signal('');
  readonly lines = signal<FormLine[]>([this.emptyLine()]);
  readonly isEditing = signal(false);
  readonly editingQuoteId = signal<string | null>(null);

  readonly draftTotal = computed(() =>
    this.lines().reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
  );

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
    { label: 'Borradores', value: '' },
    { label: 'Borrador', value: 'DRAFT' },
    { label: 'Borrador por Cliente', value: 'CUSTOMER_DRAFT' },
    { label: 'Convertido a Orden', value: 'CONVERTED_TO_ORDER' },
    { label: 'Convertido a Factura', value: 'CONVERTED_TO_INVOICE' },
    { label: 'Cancelado', value: 'CANCELLED' },
    { label: 'Todos', value: 'ALL' },
  ];

  readonly getStatusLabel = getStatusLabel;

  private emptyLine(): FormLine {
    return { product: null, quantity: 1, unitPrice: 0 };
  }

  openCreateDialog(): void {
    this.isEditing.set(false);
    this.editingQuoteId.set(null);
    this.notes.set('');
    this.lines.set([this.emptyLine()]);
    this.ensureProductsThenOpen();
  }

  openEditDialog(id: string): void {
    this.isEditing.set(true);
    this.editingQuoteId.set(id);
    this.ensureProductsThenOpen(() => {
      this.quotesService.loadQuoteForEdit(id).subscribe(detail => {
        this.notes.set(detail.notes ?? '');
        const productMap = new Map(this.products().map(p => [p.id, p]));
        this.lines.set(
          detail.lines.map(l => ({
            product: productMap.get(l.productId) ?? null,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
          })),
        );
        if (this.lines().length === 0) {
          this.lines.set([this.emptyLine()]);
        }
        this.quotesService.openCreateDialog();
      });
    });
  }

  private ensureProductsThenOpen(after?: () => void): void {
    if (this.products().length > 0) {
      after ? after() : this.quotesService.openCreateDialog();
      return;
    }
    this.productsApi.list(undefined, undefined, 0, 100).subscribe(response => {
      this.products.set(response.content);
      after ? after() : this.quotesService.openCreateDialog();
    });
  }

  addLine(): void {
    this.lines.update(list => [...list, this.emptyLine()]);
  }

  removeLine(index: number): void {
    this.lines.update(list => list.filter((_, i) => i !== index));
  }

  updateLineProduct(index: number, product: PortalProduct): void {
    const alreadySelected = this.lines().some(
      (l, i) => i !== index && l.product?.id === product.id,
    );
    if (alreadySelected) {
      this.quotesService.notify(QUOTES_MESSAGES.duplicateProductError);
      return;
    }
    this.lines.update(list =>
      list.map((l, i) =>
        i === index ? { ...l, product, unitPrice: product.price } : l,
      ),
    );
  }

  onLineProductChange(index: number, value: PortalProduct | null): void {
    if (!value) {
      this.lines.update(list =>
        list.map((l, i) =>
          i === index ? { ...l, product: null, unitPrice: 0 } : l,
        ),
      );
      return;
    }
    this.updateLineProduct(index, value);
  }

  updateLineQuantity(index: number, quantity: number): void {
    this.lines.update(list =>
      list.map((l, i) => (i === index ? { ...l, quantity } : l)),
    );
  }

  availableProductsForLine(lineIndex: number): PortalProduct[] {
    const selectedIds = new Set(
      this.lines()
        .filter((_, i) => i !== lineIndex)
        .map(l => l.product?.id)
        .filter((id): id is string => Boolean(id)),
    );
    return this.products().filter(p => !selectedIds.has(p.id));
  }

  searchProducts(event: { query: string }, lineIndex: number): void {
    const query = event.query.toLowerCase();
    const available = this.availableProductsForLine(lineIndex);
    if (!query) {
      this.filteredSuggestions.set(available);
    } else {
      this.filteredSuggestions.set(
        available.filter(
          p => p.name.toLowerCase().includes(query) || p.code.toLowerCase().includes(query),
        ),
      );
    }
  }

  canSubmit(): boolean {
    return this.lines().every(l => l.product !== null);
  }

  submit(): void {
    if (!this.canSubmit()) {
      this.quotesService.notify(QUOTES_MESSAGES.validationError);
      return;
    }
    const currentLines = this.lines().filter(l => l.product !== null);
    const request = {
      notes: this.notes().trim() || undefined,
      lines: currentLines.map(l => ({
        productId: l.product!.id,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
      })),
    };
    if (this.isEditing() && this.editingQuoteId()) {
      this.quotesService.updateQuote(this.editingQuoteId()!, request);
    } else {
      this.quotesService.create(request);
    }
  }

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

  isDraft(status: string): boolean {
    return status === 'DRAFT' || status === 'CUSTOMER_DRAFT';
  }

  editQuote(id: string): void {
    this.openEditDialog(id);
  }

  cancelQuote(id: string): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de cancelar este presupuesto?',
      header: 'Confirmar Cancelación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'Volver',
      accept: () => {
        this.quotesService.cancelQuote(id);
      },
    });
  }

  statusSeverity(status: string): StatusSeverity {
    const map: Record<string, StatusSeverity> = {
      DRAFT: 'info',
      CUSTOMER_DRAFT: 'warn',
      CONVERTED_TO_ORDER: 'success',
      CONVERTED_TO_INVOICE: 'success',
      CONVERTED: 'success',
      EXPIRED: 'warn',
      CANCELLED: 'danger',
    };
    return map[status] ?? 'info';
  }
}
