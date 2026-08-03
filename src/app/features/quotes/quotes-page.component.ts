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
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-100">Presupuestos</h1>
          <p class="text-surface-500 mt-1">Gestiona tus presupuestos y solicitudes.</p>
        </div>
      </div>

      <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-4 shadow-2xl">
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
          <div class="flex gap-2 items-center w-full sm:w-auto">
            <p-iconField iconPosition="left" class="flex-1 sm:flex-none sm:min-w-[280px]">
              <p-inputIcon styleClass="pi pi-search" />
              <input #searchInput pInputText type="text" [value]="searchTerm()" (input)="onSearch(searchInput.value)" placeholder="Buscar..." class="w-full" />
            </p-iconField>
            <p-button #filterBtn icon="pi pi-filter" [outlined]="true" severity="secondary"
              (onClick)="filterPopover.toggle($event)" pTooltip="Filtros"
              [badge]="activeFilterCount() > 0 ? activeFilterCount().toString() : ''" badgeSeverity="contrast" />
            <p-popover #filterPopover>
              <div class="flex flex-col gap-4 p-1 min-w-[260px]">
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-sm">Filtros</span>
                  @if (activeFilterCount() > 0) {
                    <p-button label="Limpiar" [text]="true" size="small" severity="secondary" (onClick)="clearFilters()" />
                  }
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-medium text-surface-500">Estado</label>
                  <p-select [options]="statusOptions" [ngModel]="filterStatus()" (ngModelChange)="onStatusFilterChange($event)"
                    optionLabel="label" optionValue="value" placeholder="Todos" styleClass="w-full" />
                </div>
              </div>
            </p-popover>
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <i class="pi pi-spin pi-spinner text-3xl text-surface-400"></i>
        </div>
      } @else if (quotes().length === 0) {
        @let empty = emptyConfig();
        <app-empty-state [icon]="empty.icon" [title]="empty.title" [message]="empty.message" />
      } @else {
        <div class="rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden bg-surface-0 dark:bg-surface-900 shadow-2xl">
          <p-table
            [value]="quotes()"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[10, 20, 50]"
            [paginatorDropdownAppendTo]="'body'"
            styleClass="w-full"
            [rowHover]="true"
            dataKey="id"
          >
            <ng-template pTemplate="header">
              <tr class="border-b border-surface-200 dark:border-surface-700">
                <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">N° Presupuesto</th>
                <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Estado</th>
                <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Vence</th>
                <th class="text-right px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Subtotal</th>
                <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Creada</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-quote>
              <tr
                class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer"
                (click)="openDetail(quote.id)"
              >
                <td class="px-4 py-3 font-mono text-sm text-surface-700 dark:text-surface-300">{{ quote.quoteNumber }}</td>
                <td class="px-4 py-3">
                  <p-tag [value]="getStatusLabel(quote.status)" [severity]="statusSeverity(quote.status)" />
                </td>
                <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-400">{{ quote.expiryDate | date:'dd/MM/yyyy' }}</td>
                <td class="px-4 py-3 text-right font-medium tabular-nums">{{ quote.subtotal | currency:'USD':'symbol' }}</td>
                <td class="px-4 py-3 text-sm text-surface-500">{{ quote.createdAt | date:'dd/MM/yyyy' }}</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      }
    </div>

    <p-dialog
      [(visible)]="detailDialogVisible"
      [style]="{ width: '48rem' }"
      [modal]="true"
      [closable]="true"
    >
      <ng-template pTemplate="header">
        <div class="flex items-center gap-3">
          <i class="pi pi-file-edit text-xl text-surface-500"></i>
          <span class="text-lg font-semibold text-surface-900 dark:text-surface-100">Presupuesto {{ detail()?.quoteNumber }}</span>
        </div>
      </ng-template>
      @if (detail(); as d) {
        <div class="flex flex-col gap-6">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Estado</label>
              <p class="text-sm mt-1"><p-tag [value]="getStatusLabel(d.status)" [severity]="statusSeverity(d.status)" /></p>
            </div>
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Vence</label>
              <p class="text-sm mt-1 text-surface-900 dark:text-surface-100">{{ d.expiryDate | date:'dd/MM/yyyy' }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Creado por</label>
              <p class="text-sm mt-1 text-surface-900 dark:text-surface-100">{{ d.createdByName }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Creada</label>
              <p class="text-sm mt-1 text-surface-900 dark:text-surface-100">{{ d.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
            @if (d.orderNumber) {
              <div>
                <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Orden asociada</label>
                <p class="text-sm mt-1 text-surface-900 dark:text-surface-100">{{ d.orderNumber }}</p>
              </div>
            }
          </div>

          @if (d.notes) {
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Notas</label>
              <p class="text-sm mt-1 text-surface-700 dark:text-surface-300">{{ d.notes }}</p>
            </div>
          }

          <div>
            <label class="text-xs font-medium text-surface-500 uppercase tracking-wider mb-2 block">Líneas</label>
            <p-table [value]="d.lines" styleClass="w-full" dataKey="id">
              <ng-template pTemplate="header">
                <tr class="border-b border-surface-200 dark:border-surface-700">
                  <th class="text-left px-3 py-2 font-medium text-surface-500 text-xs">Producto</th>
                  <th class="text-right px-3 py-2 font-medium text-surface-500 text-xs">Cant.</th>
                  <th class="text-right px-3 py-2 font-medium text-surface-500 text-xs">Precio Unit.</th>
                  <th class="text-right px-3 py-2 font-medium text-surface-500 text-xs">Total</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-line>
                <tr class="border-b border-surface-100 dark:border-surface-800">
                  <td class="px-3 py-2 text-sm">
                    <span class="font-medium text-surface-900 dark:text-surface-100">{{ line.productName }}</span>
                    <span class="text-surface-400 ml-1 font-mono text-xs">({{ line.productCode }})</span>
                  </td>
                  <td class="px-3 py-2 text-right text-sm">{{ line.quantity }}</td>
                  <td class="px-3 py-2 text-right text-sm tabular-nums">{{ line.unitPrice | currency:'USD':'symbol' }}</td>
                  <td class="px-3 py-2 text-right text-sm font-medium tabular-nums">{{ line.lineTotal | currency:'USD':'symbol' }}</td>
                </tr>
              </ng-template>
            </p-table>
            <div class="flex justify-end mt-3">
              <span class="text-lg font-bold text-surface-900 dark:text-surface-100">{{ d.subtotal | currency:'USD':'symbol' }}</span>
            </div>
          </div>
        </div>
      }
      <ng-template pTemplate="footer">
        <p-button label="Cerrar" (click)="detailDialogVisible.set(false)" severity="secondary" [text]="true" />
      </ng-template>
    </p-dialog>

    <p-toast />
  `,
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
