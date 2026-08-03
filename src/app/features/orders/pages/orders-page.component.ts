import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
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
import { SelectModule } from 'primeng/select';
import { PopoverModule } from 'primeng/popover';
import { ConfirmationService } from 'primeng/api';
import { OrdersService } from '@features/orders/services/application/orders.service';
import { getStatusLabel } from '@shared/utils/status-labels';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast' | undefined;

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [
    CurrencyPipe, DatePipe, FormsModule,
    TableModule, TagModule, DialogModule, ButtonModule,
    ConfirmDialogModule, TooltipModule, IconFieldModule, InputIconModule,
    InputTextModule, SelectModule, PopoverModule, EmptyStateComponent,
  ],
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './orders-page.component.html',
})
export class OrdersPageComponent {
  private readonly ordersService = inject(OrdersService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly loading = this.ordersService.loading;
  readonly orders = this.ordersService.orders;
  readonly detail = this.ordersService.detail;
  readonly detailDialogVisible = this.ordersService.detailDialogVisible;
  readonly searchTerm = this.ordersService.searchTerm;
  readonly filterStatus = this.ordersService.filterStatus;

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

  confirmOrder(id: string): void {
    this.ordersService.confirmOrder(id);
  }

  cancelOrder(id: string): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de cancelar esta orden?',
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
      CONFIRMED: 'success',
      INVOICED: 'info',
      CANCELLED: 'danger',
    };
    return map[status] ?? 'info';
  }
}
