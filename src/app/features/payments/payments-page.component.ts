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

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, TableModule, TagModule, DialogModule, ButtonModule, ToastModule, TooltipModule, IconFieldModule, InputIconModule, InputTextModule, PopoverModule],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-100">Pagos</h1>
          <p class="text-surface-500 mt-1">Registro y seguimiento de tus pagos realizados.</p>
        </div>
      </div>

      <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-4 shadow-2xl mb-6">
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
              </div>
            </p-popover>
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <i class="pi pi-spin pi-spinner text-3xl text-surface-400"></i>
        </div>
      } @else if (payments().length === 0) {
        <div class="flex flex-col items-center justify-center h-64 text-surface-400 gap-3">
          <i class="pi pi-credit-card text-4xl"></i>
          <p class="text-sm">No se encontraron pagos</p>
        </div>
      } @else {
        <div class="rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden bg-surface-0 dark:bg-surface-900 shadow-2xl">
          <p-table
            [value]="payments()"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[10, 20, 50]"
            styleClass="w-full"
            [rowHover]="true"
            dataKey="id"
          >
            <ng-template pTemplate="header">
              <tr class="border-b border-surface-200 dark:border-surface-700">
                <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">N° Pago</th>
                <th class="text-right px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Monto</th>
                <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Referencia</th>
                <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Fecha</th>
                <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Estado</th>
                <th class="text-right px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Aplicado</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-payment>
              <tr
                class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer"
                (click)="openDetail(payment.id)"
              >
                <td class="px-4 py-3 font-mono text-sm text-surface-700 dark:text-surface-300">{{ payment.paymentNumber }}</td>
                <td class="px-4 py-3 text-right font-medium tabular-nums">{{ payment.amount | currency:'USD':'symbol' }}</td>
                <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-400">{{ payment.referenceNumber || '-' }}</td>
                <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-400">{{ payment.paymentDate | date:'dd/MM/yyyy' }}</td>
                <td class="px-4 py-3">
                  <p-tag [value]="getStatusLabel(payment.status)" [severity]="statusSeverity(payment.status)" />
                </td>
                <td class="px-4 py-3 text-right text-sm tabular-nums">{{ payment.appliedAmount | currency:'USD':'symbol' }}</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      }
    </div>

    <p-dialog
      [(visible)]="detailDialogVisible"
      [style]="{ width: '32rem' }"
      [modal]="true"
      [closable]="true"
    >
      <ng-template pTemplate="header">
        <div class="flex items-center gap-3">
          <i class="pi pi-credit-card text-xl text-surface-500"></i>
          <span class="text-lg font-semibold text-surface-900 dark:text-surface-100">Pago {{ detail()?.paymentNumber }}</span>
        </div>
      </ng-template>
      @if (detail(); as d) {
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">N° Pago</label>
              <p class="text-sm font-mono mt-1 text-surface-900 dark:text-surface-100">{{ d.paymentNumber }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Estado</label>
              <p class="text-sm mt-1"><p-tag [value]="getStatusLabel(d.status)" [severity]="statusSeverity(d.status)" /></p>
            </div>
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Monto</label>
              <p class="text-sm font-medium mt-1 text-surface-900 dark:text-surface-100">{{ d.amount | currency:'USD':'symbol' }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Monto Aplicado</label>
              <p class="text-sm mt-1 text-surface-900 dark:text-surface-100">{{ d.appliedAmount | currency:'USD':'symbol' }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Referencia</label>
              <p class="text-sm mt-1 text-surface-900 dark:text-surface-100">{{ d.referenceNumber || '-' }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Fecha de Pago</label>
              <p class="text-sm mt-1 text-surface-900 dark:text-surface-100">{{ d.paymentDate | date:'dd/MM/yyyy' }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Creado</label>
              <p class="text-sm mt-1 text-surface-600 dark:text-surface-400">{{ d.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
          </div>
          @if (d.notes) {
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Notas</label>
              <p class="text-sm mt-1 text-surface-700 dark:text-surface-300">{{ d.notes }}</p>
            </div>
          }
        </div>
      }
      <ng-template pTemplate="footer">
        <p-button label="Cerrar" (click)="detailDialogVisible.set(false)" severity="secondary" [text]="true" />
      </ng-template>
    </p-dialog>

    <p-toast />
  `,
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
