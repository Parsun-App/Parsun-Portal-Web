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
import { QuotesService } from '@features/quotes/services/application/quotes.service';
import { getStatusLabel } from '@shared/utils/status-labels';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

@Component({
  selector: 'app-quotes-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, TableModule, TagModule, DialogModule, ButtonModule, TooltipModule, IconFieldModule, InputIconModule, InputTextModule, SelectModule, PopoverModule, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quotes-page.component.html',
})
export class QuotesPageComponent {
  private readonly quotesService = inject(QuotesService);

  readonly loading = this.quotesService.loading;
  readonly quotes = this.quotesService.quotes;
  readonly detail = this.quotesService.detail;
  readonly detailDialogVisible = this.quotesService.detailDialogVisible;
  readonly searchTerm = this.quotesService.searchTerm;
  readonly filterStatus = this.quotesService.filterStatus;

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
      SENT: 'info',
      CONVERTED: 'success',
      CANCELLED: 'danger',
      EXPIRED: 'warn',
    };
    return map[status] ?? 'info';
  }
}
