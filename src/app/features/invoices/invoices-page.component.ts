import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, of, tap } from 'rxjs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PopoverModule } from 'primeng/popover';
import { MessageService } from 'primeng/api';
import { InvoicesApiService } from './services/api/invoices-api.service';
import { PortalInvoiceList, PortalInvoiceDetail } from '@shared/models';
import { getStatusLabel } from '@shared/utils/status-labels';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

@Component({
  selector: 'app-invoices-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, TableModule, TagModule, DialogModule, ButtonModule, ToastModule, TooltipModule, IconFieldModule, InputIconModule, InputTextModule, SelectModule, PopoverModule, EmptyStateComponent],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './invoices-page.component.html',
})
export class InvoicesPageComponent {
  private readonly api = inject(InvoicesApiService);
  private readonly messageService = inject(MessageService);
  private loadTimer: ReturnType<typeof setTimeout> | null = null;

  readonly loading = signal(false);
  readonly invoices = signal<PortalInvoiceList[]>([]);
  readonly detail = signal<PortalInvoiceDetail | null>(null);
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

  constructor() {
    this.loadInvoices();
  }

  private loadInvoices(): void {
    this.loading.set(true);
    const params: { search?: string; status?: string } = {};
    const search = this.searchTerm();
    const status = this.filterStatus();
    if (search) params.search = search;
    if (status) params.status = status;
    this.api.list(params).pipe(
      tap(response => {
        this.invoices.set(response);
        this.loading.set(false);
      }),
      catchError(() => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las facturas' });
        return of([] as PortalInvoiceList[]);
      }),
    ).subscribe();
  }

  private scheduleLoad(): void {
    if (this.loadTimer) clearTimeout(this.loadTimer);
    this.loadTimer = setTimeout(() => this.loadInvoices(), 300);
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.scheduleLoad();
  }

  onStatusFilterChange(value: string | null): void {
    this.filterStatus.set(value ?? undefined);
    this.loadInvoices();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.filterStatus.set(undefined);
    this.loadInvoices();
  }

  openDetail(id: string): void {
    this.api.getById(id).pipe(
      tap(d => {
        this.detail.set(d);
        this.detailDialogVisible.set(true);
      }),
      catchError(() => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el detalle de la factura' });
        return of(null as unknown as PortalInvoiceDetail);
      }),
    ).subscribe();
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
