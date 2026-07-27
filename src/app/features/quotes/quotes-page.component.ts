import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { catchError, of, tap } from 'rxjs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { QuotesApiService } from './services/api/quotes-api.service';
import { PortalQuoteList, PortalQuoteDetail } from '@shared/models';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast';

@Component({
  selector: 'app-quotes-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, TableModule, TagModule, DialogModule, ButtonModule, ToastModule, TooltipModule],
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

      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <i class="pi pi-spin pi-spinner text-3xl text-surface-400"></i>
        </div>
      } @else if (quotes().length === 0) {
        <div class="flex flex-col items-center justify-center h-64 text-surface-400 gap-3">
          <i class="pi pi-file-edit text-4xl"></i>
          <p class="text-sm">No se encontraron presupuestos</p>
        </div>
      } @else {
        <p-table
          [value]="quotes()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 20, 50]"
          styleClass="w-full"
          [rowHover]="true"
          dataKey="id"
        >
          <ng-template pTemplate="header">
            <tr class="border-b border-surface-200 dark:border-surface-700">
              <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">N° Presupuesto</th>
              <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Cliente</th>
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
              <td class="px-4 py-3 text-sm text-surface-900 dark:text-surface-100">{{ quote.customerName }}</td>
              <td class="px-4 py-3">
                <p-tag [value]="quote.status" [severity]="statusSeverity(quote.status)" />
              </td>
              <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-400">{{ quote.expiryDate | date:'dd/MM/yyyy' }}</td>
              <td class="px-4 py-3 text-right font-medium tabular-nums">{{ quote.subtotal | currency:'USD ' }}</td>
              <td class="px-4 py-3 text-sm text-surface-500">{{ quote.createdAt | date:'dd/MM/yyyy' }}</td>
            </tr>
          </ng-template>
        </p-table>
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
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Cliente</label>
              <p class="text-sm mt-1 text-surface-900 dark:text-surface-100">{{ d.customerName }}</p>
              <p class="text-xs text-surface-400">{{ d.customerRif }}</p>
            </div>
            <div>
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Estado</label>
              <p class="text-sm mt-1"><p-tag [value]="d.status" [severity]="statusSeverity(d.status)" /></p>
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
                  <td class="px-3 py-2 text-right text-sm tabular-nums">{{ line.unitPrice | currency:'USD ' }}</td>
                  <td class="px-3 py-2 text-right text-sm font-medium tabular-nums">{{ line.lineTotal | currency:'USD ' }}</td>
                </tr>
              </ng-template>
            </p-table>
            <div class="flex justify-end mt-3">
              <span class="text-lg font-bold text-surface-900 dark:text-surface-100">{{ d.subtotal | currency:'USD ' }}</span>
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

  readonly loading = signal(false);
  readonly quotes = signal<PortalQuoteList[]>([]);
  readonly detail = signal<PortalQuoteDetail | null>(null);
  readonly detailDialogVisible = signal(false);

  constructor() {
    this.loadQuotes();
  }

  private loadQuotes(): void {
    this.loading.set(true);
    this.api.list().pipe(
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
