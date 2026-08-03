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
import { PopoverModule } from 'primeng/popover';
import { MessageService } from 'primeng/api';
import { PaymentsApiService } from './services/api/payments-api.service';
import { PortalPaymentList, PortalPaymentDetail } from '@shared/models';
import { getStatusLabel } from '@shared/utils/status-labels';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, TableModule, TagModule, DialogModule, ButtonModule, ToastModule, TooltipModule, IconFieldModule, InputIconModule, InputTextModule, PopoverModule, EmptyStateComponent],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payments-page.component.html',
})
export class PaymentsPageComponent {
  private readonly api = inject(PaymentsApiService);
  private readonly messageService = inject(MessageService);
  private loadTimer: ReturnType<typeof setTimeout> | null = null;

  readonly loading = signal(false);
  readonly payments = signal<PortalPaymentList[]>([]);
  readonly detail = signal<PortalPaymentDetail | null>(null);
  readonly detailDialogVisible = signal(false);

  readonly searchTerm = signal('');

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.searchTerm()) count++;
    return count;
  });

  readonly hasActiveFilters = computed(() => Boolean(this.searchTerm()));

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

  readonly getStatusLabel = getStatusLabel;

  constructor() {
    this.loadPayments();
  }

  private loadPayments(): void {
    this.loading.set(true);
    const params: { search?: string } = {};
    if (this.searchTerm()) params.search = this.searchTerm();
    this.api.list(params).pipe(
      tap(response => {
        this.payments.set(response);
        this.loading.set(false);
      }),
      catchError(() => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los pagos' });
        return of([] as PortalPaymentList[]);
      }),
    ).subscribe();
  }

  private scheduleLoad(): void {
    if (this.loadTimer) clearTimeout(this.loadTimer);
    this.loadTimer = setTimeout(() => this.loadPayments(), 300);
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.scheduleLoad();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.loadPayments();
  }

  openDetail(id: string): void {
    this.api.getById(id).pipe(
      tap(d => {
        this.detail.set(d);
        this.detailDialogVisible.set(true);
      }),
      catchError(() => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el detalle del pago' });
        return of(null as unknown as PortalPaymentDetail);
      }),
    ).subscribe();
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
}
