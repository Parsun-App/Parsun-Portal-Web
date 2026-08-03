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
import { QuotesApiService } from './services/api/quotes-api.service';
import { PortalQuoteList, PortalQuoteDetail } from '@shared/models';
import { getStatusLabel } from '@shared/utils/status-labels';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

@Component({
  selector: 'app-quotes-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, TableModule, TagModule, DialogModule, ButtonModule, ToastModule, TooltipModule, IconFieldModule, InputIconModule, InputTextModule, SelectModule, PopoverModule, EmptyStateComponent],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quotes-page.component.html',
})
export class QuotesPageComponent {
  private readonly api = inject(QuotesApiService);
  private readonly messageService = inject(MessageService);
  private loadTimer: ReturnType<typeof setTimeout> | null = null;

  readonly loading = signal(false);
  readonly quotes = signal<PortalQuoteList[]>([]);
  readonly detail = signal<PortalQuoteDetail | null>(null);
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

  constructor() {
    this.loadQuotes();
  }

  private loadQuotes(): void {
    this.loading.set(true);
    const params: { search?: string; status?: string } = {};
    const search = this.searchTerm();
    const status = this.filterStatus();
    if (search) params.search = search;
    if (status) params.status = status;
    this.api.list(params).pipe(
      tap(response => {
        this.quotes.set(response);
        this.loading.set(false);
      }),
      catchError(() => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los presupuestos' });
        return of([] as PortalQuoteList[]);
      }),
    ).subscribe();
  }

  private scheduleLoad(): void {
    if (this.loadTimer) clearTimeout(this.loadTimer);
    this.loadTimer = setTimeout(() => this.loadQuotes(), 300);
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.scheduleLoad();
  }

  onStatusFilterChange(value: string | null): void {
    this.filterStatus.set(value ?? undefined);
    this.loadQuotes();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.filterStatus.set(undefined);
    this.loadQuotes();
  }

  openDetail(id: string): void {
    this.api.getById(id).pipe(
      tap(d => {
        this.detail.set(d);
        this.detailDialogVisible.set(true);
      }),
      catchError(() => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el detalle del presupuesto' });
        return of(null as unknown as PortalQuoteDetail);
      }),
    ).subscribe();
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
