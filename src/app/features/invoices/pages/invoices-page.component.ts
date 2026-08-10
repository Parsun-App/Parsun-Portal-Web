import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
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
import { InvoicesService } from '@features/invoices/services/application/invoices.service';
import { getStatusLabel } from '@shared/utils/status-labels';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

@Component({
  selector: 'app-invoices-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, TableModule, TagModule, DialogModule, ButtonModule, TooltipModule, IconFieldModule, InputIconModule, InputTextModule, SelectModule, DatePickerModule, PopoverModule, EmptyStateComponent],
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
  readonly dateFrom = this.invoicesService.dateFrom;
  readonly dateTo = this.invoicesService.dateTo;
  readonly dateFromDate = signal<Date | null>(null);
  readonly dateToDate = signal<Date | null>(null);

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

  onDateFromChange(value: Date | null): void {
    this.dateFromDate.set(value);
    const from = value ? this.formatDate(value) : '';
    this.invoicesService.onDateFilterChange(from, this.dateTo());
  }

  onDateToChange(value: Date | null): void {
    this.dateToDate.set(value);
    const to = value ? this.formatDate(value) : '';
    this.invoicesService.onDateFilterChange(this.dateFrom(), to);
  }

  clearFilters(): void {
    this.dateFromDate.set(null);
    this.dateToDate.set(null);
    this.invoicesService.clearFilters();
  }

  openDetail(id: string): void {
    this.invoicesService.openDetail(id);
  }

  parseDate(dateStr: string): Date {
    return new Date(dateStr + 'T00:00:00');
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

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
