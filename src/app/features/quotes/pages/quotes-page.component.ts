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
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { PopoverModule } from 'primeng/popover';
import { QuotesService } from '@features/quotes/services/application/quotes.service';
import { getStatusLabel } from '@shared/utils/status-labels';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

interface FormLine {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  warehouseId: string;
  warehouseName: string;
}

@Component({
  selector: 'app-quotes-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, TableModule, TagModule, DialogModule, ButtonModule,
            TooltipModule, IconFieldModule, InputIconModule, InputTextModule, InputNumberModule, TextareaModule, SelectModule, PopoverModule, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quotes-page.component.html',
})
export class QuotesPageComponent {
  private readonly quotesService = inject(QuotesService);

  readonly loading = this.quotesService.loading;
  readonly creating = this.quotesService.creating;
  readonly quotes = this.quotesService.quotes;
  readonly detail = this.quotesService.detail;
  readonly detailDialogVisible = this.quotesService.detailDialogVisible;
  readonly createDialogVisible = this.quotesService.createDialogVisible;
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
    { label: 'Borrador por Cliente', value: 'CUSTOMER_DRAFT' },
    { label: 'Convertido a Orden', value: 'CONVERTED_TO_ORDER' },
    { label: 'Convertido a Factura', value: 'CONVERTED_TO_INVOICE' },
    { label: 'Cancelado', value: 'CANCELLED' },
  ];

  readonly getStatusLabel = getStatusLabel;

  readonly formNotes = signal('');
  readonly formLines = signal<FormLine[]>([this.emptyLine()]);

  private emptyLine(): FormLine {
    return { productId: '', productName: '', quantity: 1, unitPrice: 0, warehouseId: '', warehouseName: '' };
  }

  addLine(): void {
    this.formLines.update(lines => [...lines, this.emptyLine()]);
  }

  removeLine(index: number): void {
    this.formLines.update(lines => lines.filter((_, i) => i !== index));
  }

  openCreate(): void {
    this.formNotes.set('');
    this.formLines.set([this.emptyLine()]);
    this.quotesService.openCreate();
  }

  submitCreate(): void {
    const lines = this.formLines();
    const request = {
      notes: this.formNotes() || undefined,
      lines: lines.map(l => ({
        productId: l.productId,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        warehouseAllocations: [{ warehouseId: l.warehouseId, allocatedQuantity: l.quantity }],
      })),
    };
    this.quotesService.create(request);
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

  statusSeverity(status: string): StatusSeverity {
    const map: Record<string, StatusSeverity> = {
      DRAFT: 'info',
      CUSTOMER_DRAFT: 'warn',
      CONVERTED_TO_ORDER: 'success',
      CONVERTED_TO_INVOICE: 'success',
      CANCELLED: 'danger',
    };
    return map[status] ?? 'info';
  }

  canCreate(): boolean {
    return this.formLines().every(l => l.productId && l.quantity > 0 && l.unitPrice > 0 && l.warehouseId);
  }
}
