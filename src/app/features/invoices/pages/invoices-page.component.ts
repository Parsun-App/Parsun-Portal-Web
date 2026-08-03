import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
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
import { InvoicesService } from '@features/invoices/services/application/invoices.service';
import { getStatusLabel } from '@shared/utils/status-labels';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

@Component({
  selector: 'app-invoices-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, TableModule, TagModule, DialogModule, ButtonModule, TooltipModule, IconFieldModule, InputIconModule, InputTextModule, SelectModule, PopoverModule, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invoices-page.component.html',
})
export class InvoicesPageComponent {
  private readonly invoicesService = inject(InvoicesService);

  readonly loading = this.invoicesService.loading;
  readonly invoices = this.invoicesService.invoices;
  readonly detail = this.invoicesService.detail;
  readonly detailDialogVisible = this.invoicesService.detailDialogVisible;
  readonly searchTerm = this.invoicesService.searchTerm;
  readonly filterStatus = this.invoicesService.filterStatus;

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
        icon: 'pi pi-file-invoice',
        title: 'Sin resultados',
        message: 'No encontramos resultados para tu búsqueda o filtros actuales.',
      };
    }
    return {
      icon: 'pi pi-file-invoice',
      title: 'No hay facturas',
      message: 'Tus facturas aparecerán aquí cuando los tengas.',
    };
  });

  readonly statusOptions = [
    { label: 'Pendiente de Pago', value: 'PENDING_PAYMENT' },
    { label: 'Parcialmente Pagada', value: 'PARTIALLY_PAID' },
    { label: 'Pagada', value: 'PAID' },
    { label: 'Vencida', value: 'OVERDUE' },
    { label: 'Cancelado', value: 'CANCELLED' },
  ];

  readonly getStatusLabel = getStatusLabel;

  onSearch(value: string): void {
    this.invoicesService.onSearch(value);
  }

  onStatusFilterChange(value: string | null): void {
    this.invoicesService.onStatusFilterChange(value);
  }

  clearFilters(): void {
    this.invoicesService.clearFilters();
  }

  openDetail(id: string): void {
    this.invoicesService.openDetail(id);
  }

  statusSeverity(status: string): StatusSeverity {
    const map: Record<string, StatusSeverity> = {
      PAID: 'success',
      PENDING_PAYMENT: 'warn',
      PARTIALLY_PAID: 'info',
      CANCELLED: 'danger',
      OVERDUE: 'danger',
    };
    return map[status] ?? 'info';
  }
}
