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
import { OrdersService } from '@features/orders/services/application/orders.service';
import { ProductsApiService } from '@features/products/services/api/products-api.service';
import { PortalProduct } from '@features/products/models';
import { getStatusLabel } from '@shared/utils/status-labels';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ORDERS_MESSAGES } from '@features/orders/messages/orders.messages';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast' | undefined;

interface FormLine {
  product: PortalProduct | null;
  quantity: number;
  unitPrice: number;
}

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [
    CurrencyPipe, DatePipe, FormsModule,
    TableModule, TagModule, DialogModule, ButtonModule,
    ConfirmDialogModule, TooltipModule, IconFieldModule, InputIconModule,
    InputTextModule, InputNumberModule, TextareaModule,
    SelectModule, PopoverModule, AutoCompleteModule, EmptyStateComponent,
  ],
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './orders-page.component.html',
})
export class OrdersPageComponent {
  readonly ordersService = inject(OrdersService);
  private readonly productsApi = inject(ProductsApiService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly loading = this.ordersService.loading;
  readonly creating = this.ordersService.creating;
  readonly orders = this.ordersService.orders;
  readonly detail = this.ordersService.detail;
  readonly detailDialogVisible = this.ordersService.detailDialogVisible;
  readonly createDialogVisible = this.ordersService.createDialogVisible;
  readonly searchTerm = this.ordersService.searchTerm;
  readonly filterStatus = this.ordersService.filterStatus;

  readonly products = signal<PortalProduct[]>([]);
  readonly filteredSuggestions = signal<PortalProduct[]>([]);
  readonly notes = signal('');
  readonly lines = signal<FormLine[]>([this.emptyLine()]);
  readonly isEditing = signal(false);
  readonly editingOrderId = signal<string | null>(null);

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
        icon: 'pi pi-shopping-cart',
        title: 'Sin resultados',
        message: 'No encontramos resultados para tu búsqueda o filtros actuales.',
      };
    }
    return {
      icon: 'pi pi-shopping-cart',
      title: 'No hay pedidos',
      message: 'Tus pedidos aparecerán aquí cuando los tengas.',
    };
  });

  readonly statusOptions = [
    { label: 'Todos los borradores', value: '' },
    { label: 'Borrador', value: 'DRAFT' },
    { label: 'Borrador de Cliente', value: 'CUSTOMER_DRAFT' },
    { label: 'Confirmado', value: 'CONFIRMED' },
    { label: 'Facturado', value: 'INVOICED' },
    { label: 'Cancelado', value: 'CANCELLED' },
    { label: 'Todos', value: 'ALL' },
  ];

  readonly getStatusLabel = getStatusLabel;

  private emptyLine(): FormLine {
    return { product: null, quantity: 1, unitPrice: 0 };
  }

  openCreateDialog(): void {
    this.isEditing.set(false);
    this.editingOrderId.set(null);
    this.notes.set('');
    this.lines.set([this.emptyLine()]);
    this.ensureProductsThenOpen();
  }

  openEditDialog(id: string): void {
    this.isEditing.set(true);
    this.editingOrderId.set(id);
    this.ensureProductsThenOpen(() => {
      this.ordersService.loadOrderForEdit(id).subscribe(detail => {
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
        this.ordersService.openCreateDialog();
      });
    });
  }

  private ensureProductsThenOpen(after?: () => void): void {
    if (this.products().length > 0) {
      after ? after() : this.ordersService.openCreateDialog();
      return;
    }
    this.productsApi.list(undefined, undefined, 0, 100).subscribe(response => {
      this.products.set(response.content);
      after ? after() : this.ordersService.openCreateDialog();
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
      this.ordersService.notify(ORDERS_MESSAGES.duplicateProductError);
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
      this.ordersService.notify(ORDERS_MESSAGES.validationError);
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
    if (this.isEditing() && this.editingOrderId()) {
      this.ordersService.updateOrder(this.editingOrderId()!, request);
    } else {
      this.ordersService.create(request);
    }
  }

  onSearch(value: string): void {
    this.ordersService.onSearch(value);
  }

  onStatusFilterChange(value: string | null): void {
    this.ordersService.onStatusFilterChange(value);
  }

  clearFilters(): void {
    this.ordersService.clearFilters();
  }

  openDetail(id: string): void {
    this.ordersService.openDetail(id);
  }

  isDraft(status: string): boolean {
    return status === 'DRAFT' || status === 'CUSTOMER_DRAFT';
  }

  editOrder(id: string): void {
    this.openEditDialog(id);
  }

  cancelOrder(id: string): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de cancelar este pedido?',
      header: 'Confirmar Cancelación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'Volver',
      accept: () => {
        this.ordersService.cancelOrder(id);
      },
    });
  }

  statusSeverity(status: string): StatusSeverity {
    const map: Record<string, StatusSeverity> = {
      DRAFT: 'info',
      CUSTOMER_DRAFT: 'warn',
      CONFIRMED: 'success',
      INVOICED: 'info',
      CANCELLED: 'danger',
    };
    return map[status] ?? 'info';
  }
}
