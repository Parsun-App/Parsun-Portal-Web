import {
  Component,
  inject,
  computed,
  signal,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { CurrencyPipe, DatePipe, Location } from '@angular/common';
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
import { DatePickerModule } from 'primeng/datepicker';
import { PopoverModule } from 'primeng/popover';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PaginatorModule } from 'primeng/paginator';
import type { PaginatorState } from 'primeng/paginator';
import { ConfirmationService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from '@features/orders/services/application/orders.service';
import { PortalOrderList } from '@features/orders/models';
import { ProductsApiService } from '@features/products/services/api/products-api.service';
import { PortalProduct } from '@features/products/models';
import { getStatusLabel } from '@shared/utils/status-labels';
import { PORTAL_MODULE_COLORS } from '@shared/utils/module-colors';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { MetricCardComponent, PageHeaderComponent } from '@shared/components/ui';
import {
  ListActionButtonsComponent,
  ListFiltersComponent,
  type ListAction,
} from '@shared/components/list';
import { OrderDetailDialogComponent } from '@features/orders/components/order-detail-dialog/order-detail-dialog.component';
import { OrderFormDialogComponent } from '@features/orders/components/order-form-dialog/order-form-dialog.component';
import { ORDERS_MESSAGES } from '@features/orders/messages/orders.messages';
import { clearNotificationFocusFromUrl } from '@shared/utils/notification-focus-url';

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
    CurrencyPipe,
    DatePipe,
    FormsModule,
    TableModule,
    TagModule,
    DialogModule,
    ButtonModule,
    ConfirmDialogModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    PopoverModule,
    AutoCompleteModule,
    PaginatorModule,
    EmptyStateComponent,
    ListFiltersComponent,
    ListActionButtonsComponent,
    MetricCardComponent,
    OrderDetailDialogComponent,
    OrderFormDialogComponent,
    PageHeaderComponent,
  ],
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './orders-page.component.html',
})
export class OrdersPageComponent implements OnInit {
  private readonly destroy$ = new Subject<void>();
  readonly colors = PORTAL_MODULE_COLORS;
  private readonly ordersService = inject(OrdersService);
  private readonly productsApi = inject(ProductsApiService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private focusedId: string | null = null;
  private productCreationKey: string | null = null;

  ngOnInit(): void {
    this.ordersService.load();
    this.ordersService.createDialogRequested$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.openCreateDialog());
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.consumeFocus(params.get('focus'));
      this.consumeProductCreation(
        params.get('create'),
        params.get('productId'),
        params.get('quantity'),
      );
    });
  }

  readonly loading = this.ordersService.loading;
  readonly creating = this.ordersService.creating;
  readonly orders = this.ordersService.orders;
  readonly detail = this.ordersService.detail;
  readonly detailDialogVisible = this.ordersService.detailDialogVisible;
  readonly createDialogVisible = this.ordersService.createDialogVisible;
  readonly searchTerm = this.ordersService.searchTerm;

  readonly pendingOrders = computed(
    () => this.orders().filter((o) => o.status === 'DRAFT' || o.status === 'CUSTOMER_DRAFT').length,
  );
  readonly ordersTotal = computed(() => this.orders().reduce((s, o) => s + o.subtotal, 0));
  readonly filterStatus = this.ordersService.filterStatus;
  readonly dateFrom = this.ordersService.dateFrom;
  readonly dateTo = this.ordersService.dateTo;
  readonly dateFromDate = signal<Date | null>(null);
  readonly dateToDate = signal<Date | null>(null);

  readonly mobileFirst = signal(0);
  readonly mobileRows = 10;
  readonly mobileOrders = computed(() => {
    const start = this.mobileFirst();
    return this.orders().slice(start, start + this.mobileRows);
  });

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
    if (this.filterStatus()) count++;
    if (this.dateFrom() || this.dateTo()) count++;
    return count;
  });

  readonly hasActiveFilters = computed(
    () =>
      Boolean(this.searchTerm()) ||
      Boolean(this.filterStatus()) ||
      Boolean(this.dateFrom()) ||
      Boolean(this.dateTo()),
  );

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
      this.ordersService.loadOrderForEdit(id).subscribe((detail) => {
        this.notes.set(detail.notes ?? '');
        const productMap = new Map(this.products().map((p) => [p.id, p]));
        this.lines.set(
          detail.lines.map((l) => ({
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
    this.productsApi.list(undefined, undefined, 0, 100).subscribe((response) => {
      this.products.set(response.content);
      after ? after() : this.ordersService.openCreateDialog();
    });
  }

  private consumeProductCreation(
    action: string | null,
    productId: string | null,
    rawQuantity: string | null,
  ): void {
    if (action !== 'product' || !productId) return;
    const quantity = Math.max(Number.parseInt(rawQuantity ?? '1', 10) || 1, 1);
    const key = `${productId}:${quantity}`;
    if (key === this.productCreationKey) return;
    this.productCreationKey = key;
    this.ensureProductsThenOpen(() => {
      const product = this.products().find((item) => item.id === productId);
      if (!product) {
        void this.clearProductCreationParams();
        return;
      }
      this.isEditing.set(false);
      this.editingOrderId.set(null);
      this.notes.set('');
      this.lines.set([
        {
          product,
          quantity: Math.min(quantity, Math.max(product.availableStock, 1)),
          unitPrice: product.price,
        },
      ]);
      this.ordersService.openCreateDialog();
      void this.clearProductCreationParams();
    });
  }

  private clearProductCreationParams(): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { create: null, productId: null, quantity: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  addLine(): void {
    this.lines.update((list) => [...list, this.emptyLine()]);
  }

  removeLine(index: number): void {
    this.lines.update((list) => list.filter((_, i) => i !== index));
  }

  updateLineProduct(index: number, product: PortalProduct): void {
    const alreadySelected = this.lines().some(
      (l, i) => i !== index && l.product?.id === product.id,
    );
    if (alreadySelected) {
      this.ordersService.notify(ORDERS_MESSAGES.duplicateProductError);
      return;
    }
    this.lines.update((list) =>
      list.map((l, i) => (i === index ? { ...l, product, unitPrice: product.price } : l)),
    );
  }

  onLineProductChange(index: number, value: PortalProduct | null): void {
    if (!value) {
      this.lines.update((list) =>
        list.map((l, i) => (i === index ? { ...l, product: null, unitPrice: 0 } : l)),
      );
      return;
    }
    this.updateLineProduct(index, value);
  }

  updateLineQuantity(index: number, quantity: number): void {
    this.lines.update((list) => list.map((l, i) => (i === index ? { ...l, quantity } : l)));
  }

  availableProductsForLine(lineIndex: number): PortalProduct[] {
    const selectedIds = new Set(
      this.lines()
        .filter((_, i) => i !== lineIndex)
        .map((l) => l.product?.id)
        .filter((id): id is string => Boolean(id)),
    );
    return this.products().filter((p) => !selectedIds.has(p.id));
  }

  searchProducts(event: { query: string }, lineIndex: number): void {
    const query = event.query.toLowerCase();
    const available = this.availableProductsForLine(lineIndex);
    if (!query) {
      this.filteredSuggestions.set(available);
    } else {
      this.filteredSuggestions.set(
        available.filter(
          (p) => p.name.toLowerCase().includes(query) || p.code.toLowerCase().includes(query),
        ),
      );
    }
  }

  canSubmit(): boolean {
    return this.lines().every((l) => l.product !== null);
  }

  submit(): void {
    if (!this.canSubmit()) {
      this.ordersService.notify(ORDERS_MESSAGES.validationError);
      return;
    }
    const currentLines = this.lines().filter((l) => l.product !== null);
    const request = {
      notes: this.notes().trim() || undefined,
      lines: currentLines.map((l) => ({
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

  openDetail(id: string): void {
    this.ordersService.openDetail(id);
  }

  actionsFor(order: PortalOrderList): ListAction[] {
    const actions: ListAction[] = [
      { label: 'Ver detalle', icon: 'pi pi-eye', command: () => this.openDetail(order.id) },
    ];
    if (this.isDraft(order.status)) {
      actions.push(
        { label: 'Editar', icon: 'pi pi-pencil', command: () => this.editOrder(order.id) },
        {
          label: 'Cancelar',
          icon: 'pi pi-trash',
          command: () => this.cancelOrder(order.id),
          danger: true,
        },
      );
    }
    return actions;
  }

  closeDetail(): void {
    this.detailDialogVisible.set(false);
    void this.clearFocus();
  }

  private consumeFocus(focus: string | null): void {
    if (!focus) {
      this.focusedId = null;
      return;
    }
    if (focus === this.focusedId) return;
    this.focusedId = focus;
    this.openDetail(focus);
    void this.clearFocus();
  }

  async clearFocus(): Promise<void> {
    try {
      const cleared = await this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { focus: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
      if (!cleared) await this.reconcileFocusCleanup();
    } catch {
      await this.reconcileFocusCleanup();
    }
  }

  private async reconcileFocusCleanup(): Promise<void> {
    await Promise.resolve();
    const cleanupTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: { focus: null },
      queryParamsHandling: 'merge',
    });
    try {
      const reconciled = await this.router.navigateByUrl(cleanupTree, { replaceUrl: true });
      if (!reconciled) clearNotificationFocusFromUrl(this.location);
    } catch {
      clearNotificationFocusFromUrl(this.location);
    }
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
      DRAFT: 'secondary',
      CUSTOMER_DRAFT: 'warn',
      CONFIRMED: 'info',
      INVOICED: 'success',
      CANCELLED: 'danger',
    };
    return map[status] ?? 'info';
  }

  onDateFromChange(value: Date | null): void {
    this.dateFromDate.set(value);
    const from = value ? this.formatDate(value) : '';
    this.ordersService.onDateFilterChange(from, this.dateTo());
  }

  onDateToChange(value: Date | null): void {
    this.dateToDate.set(value);
    const to = value ? this.formatDate(value) : '';
    this.ordersService.onDateFilterChange(this.dateFrom(), to);
  }

  clearFilters(): void {
    this.dateFromDate.set(null);
    this.dateToDate.set(null);
    this.ordersService.clearFilters();
  }

  onMobilePageChange(event: PaginatorState): void {
    this.mobileFirst.set(event.first ?? 0);
  }

  parseDate(dateStr: string): Date {
    return new Date(dateStr + 'T00:00:00');
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
