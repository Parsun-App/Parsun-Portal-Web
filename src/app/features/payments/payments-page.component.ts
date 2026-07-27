import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { catchError, of, tap } from 'rxjs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PaymentsApiService } from './services/api/payments-api.service';
import { PortalPaymentList, PortalPaymentDetail } from '@shared/models';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, TableModule, TagModule, DialogModule, ButtonModule, ToastModule],
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
                <p-tag [value]="payment.status" [severity]="statusSeverity(payment.status)" />
              </td>
              <td class="px-4 py-3 text-right text-sm tabular-nums">{{ payment.appliedAmount | currency:'USD':'symbol' }}</td>
            </tr>
          </ng-template>
        </p-table>
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
              <p class="text-sm mt-1"><p-tag [value]="d.status" [severity]="statusSeverity(d.status)" /></p>
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

  readonly loading = signal(false);
  readonly payments = signal<PortalPaymentList[]>([]);
  readonly detail = signal<PortalPaymentDetail | null>(null);
  readonly detailDialogVisible = signal(false);

  constructor() {
    this.loadPayments();
  }

  private loadPayments(): void {
    this.loading.set(true);
    this.api.list().pipe(
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
