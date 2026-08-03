import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, of, tap } from 'rxjs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PopoverModule } from 'primeng/popover';
import { ConfirmationService, MessageService } from 'primeng/api';
import { OrdersApiService } from './services/api/orders-api.service';
import { PortalOrderList, PortalOrderDetail } from '@shared/models';
import { getStatusLabel } from '@shared/utils/status-labels';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast' | undefined;

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [
    CurrencyPipe, DatePipe, FormsModule,
    TableModule, TagModule, DialogModule, ButtonModule, ToastModule,
    ConfirmDialogModule, TooltipModule, IconFieldModule, InputIconModule,
    InputTextModule, SelectModule, PopoverModule, EmptyStateComponent,
  ],
  providers: [MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './orders-page.component.html',
})
export class OrdersPageComponent {
  private readonly api = inject(OrdersApiService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private loadTimer: ReturnType<typeof setTimeout> | null = null;

  readonly loading = signal(false);
  readonly orders = signal<PortalOrderList[]>([]);
  readonly detail = signal<PortalOrderDetail | null>(null);
  readonly detailDialogVisible = signal(false);

  readonly searchTerm = signal('');
  readonly filterStatus = signal<string | undefined>(undefined);

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
      title: 'No hay órdenes',
      message: 'Tus órdenes aparecerán aquí cuando los tengas.',
    };
  });

  readonly statusOptions = [
    { label: 'Borrador', value: 'DRAFT' },
    { label: 'Confirmado', value: 'CONFIRMED' },
    { label: 'Facturado', value: 'INVOICED' },
    { label: 'Cancelado', value: 'CANCELLED' },
  ];

  readonly getStatusLabel = getStatusLabel;

  constructor() {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.loading.set(true);
    const params: { search?: string; status?: string } = {};
    const search = this.searchTerm();
    const status = this.filterStatus();
    if (search) params.search = search;
    if (status) params.status = status;
    this.api.list(params).pipe(
      tap(response => {
        this.orders.set(response);
        this.loading.set(false);
      }),
      catchError(() => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las órdenes' });
        return of([] as PortalOrderList[]);
      }),
    ).subscribe();
  }

  private scheduleLoad(): void {
    if (this.loadTimer) clearTimeout(this.loadTimer);
    this.loadTimer = setTimeout(() => this.loadOrders(), 300);
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.scheduleLoad();
  }

  onStatusFilterChange(value: string | null): void {
    this.filterStatus.set(value ?? undefined);
    this.loadOrders();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.filterStatus.set(undefined);
    this.loadOrders();
  }

  openDetail(id: string): void {
    this.api.getById(id).pipe(
      tap(d => {
        this.detail.set(d);
        this.detailDialogVisible.set(true);
      }),
      catchError(() => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el detalle de la orden' });
        return of(null as unknown as PortalOrderDetail);
      }),
    ).subscribe();
  }

  confirmOrder(id: string): void {
    this.api.confirm(id).pipe(
      tap(() => {
        this.messageService.add({ severity: 'success', summary: 'Confirmada', detail: 'Orden confirmada exitosamente' });
        this.loadOrders();
      }),
      catchError(() => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo confirmar la orden' });
        return of(void 0);
      }),
    ).subscribe();
  }

  cancelOrder(id: string): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de cancelar esta orden?',
      header: 'Confirmar Cancelación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'Volver',
      accept: () => {
        this.api.cancel(id, 'Cancelado por el cliente').pipe(
          tap(() => {
            this.messageService.add({ severity: 'info', summary: 'Cancelada', detail: 'Orden cancelada' });
            this.loadOrders();
          }),
          catchError(() => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cancelar la orden' });
            return of(void 0);
          }),
        ).subscribe();
      },
    });
  }

  statusSeverity(status: string): StatusSeverity {
    const map: Record<string, StatusSeverity> = {
      DRAFT: 'info',
      CONFIRMED: 'success',
      INVOICED: 'info',
      CANCELLED: 'danger',
    };
    return map[status] ?? 'info';
  }
}
