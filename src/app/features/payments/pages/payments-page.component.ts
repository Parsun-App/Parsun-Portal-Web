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
import { DatePickerModule } from 'primeng/datepicker';
import { PopoverModule } from 'primeng/popover';
import { PaymentsService } from '@features/payments/services/application/payments.service';
import { getStatusLabel } from '@shared/utils/status-labels';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, TableModule, TagModule, DialogModule, ButtonModule, TooltipModule, IconFieldModule, InputIconModule, InputTextModule, SelectModule, DatePickerModule, PopoverModule, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payments-page.component.html',
})
export class PaymentsPageComponent {
  private readonly paymentsService = inject(PaymentsService);

  readonly loading = this.paymentsService.loading;
  readonly payments = this.paymentsService.payments;
  readonly detail = this.paymentsService.detail;
  readonly detailDialogVisible = this.paymentsService.detailDialogVisible;
  readonly searchTerm = this.paymentsService.searchTerm;
  readonly filterStatus = this.paymentsService.filterStatus;
  readonly dateFrom = this.paymentsService.dateFrom;
  readonly dateTo = this.paymentsService.dateTo;

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.searchTerm()) count++;
    if (this.filterStatus()) count++;
    if (this.dateFrom() || this.dateTo()) count++;
    return count;
  });

  readonly hasActiveFilters = computed(() => Boolean(this.searchTerm()) || Boolean(this.filterStatus()) || Boolean(this.dateFrom()) || Boolean(this.dateTo()));

  readonly emptyConfig = computed(() => {
    if (this.hasActiveFilters()) {
      return {
        icon: 'pi pi-credit-card',
        title: 'Sin resultados',
        message: 'No encontramos resultados para tu búsqueda o filtros actuales.',
      };
    }
    return {
      icon: 'pi pi-credit-card',
      title: 'No hay pagos',
      message: 'Tus pagos aparecerán aquí cuando los tengas.',
    };
  });

  readonly statusOptions = [
    { label: 'Aplicado', value: 'APPLIED' },
    { label: 'Pendiente', value: 'PENDING' },
    { label: 'Cancelado', value: 'CANCELLED' },
    { label: 'Rechazado', value: 'REJECTED' },
  ];

  readonly getStatusLabel = getStatusLabel;

  onSearch(value: string): void {
    this.paymentsService.onSearch(value);
  }

  onStatusFilterChange(value: string | null): void {
    this.paymentsService.onStatusFilterChange(value);
  }

  onDateFromChange(value: Date | null): void {
    const from = value ? this.formatDate(value) : '';
    this.paymentsService.onDateFilterChange(from, this.dateTo());
  }

  onDateToChange(value: Date | null): void {
    const to = value ? this.formatDate(value) : '';
    this.paymentsService.onDateFilterChange(this.dateFrom(), to);
  }

  clearFilters(): void {
    this.paymentsService.clearFilters();
  }

  openDetail(id: string): void {
    this.paymentsService.openDetail(id);
  }

  statusSeverity(status: string): StatusSeverity {
    const map: Record<string, StatusSeverity> = {
      APPLIED: 'success',
      PENDING: 'warn',
      CANCELLED: 'danger',
      REJECTED: 'danger',
    };
    return map[status] ?? 'info';
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  parseDate(dateStr: string): Date {
    return new Date(dateStr + 'T00:00:00');
  }
}
