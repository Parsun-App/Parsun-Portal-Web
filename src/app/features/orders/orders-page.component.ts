import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { catchError, of, tap } from 'rxjs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { OrdersApiService } from './services/api/orders-api.service';
import { PortalOrderList, PortalOrderDetail } from '@shared/models';

type StatusSeverity = 'info' | 'success' | 'danger' | 'warn' | 'secondary' | 'contrast' | undefined;

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [
    CurrencyPipe, DatePipe, FormsModule,
    TableModule, TagModule, DialogModule, ButtonModule, ToastModule,
    ConfirmDialogModule, TooltipModule, InputTextModule,
  ],
  providers: [MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-100">Órdenes</h1>
          <p class="text-surface-500 mt-1">Historial y seguimiento de tus órdenes de compra.</p>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <i class="pi pi-spin pi-spinner text-3xl text-surface-400"></i>
        </div>
      } @else if (orders().length === 0) {
        <div class="flex flex-col items-center justify-center h-64 text-surface-400 gap-3">
          <i class="pi pi-shopping-cart text-4xl"></i>
          <p class="text-sm">No se encontraron órdenes</p>
        </div>
      } @else {
        <p-table
          [value]="orders()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 20, 50]"
          styleClass="w-full"
          [rowHover]="true"
          dataKey="id"
        >
          <ng-template pTemplate="header">
            <tr class="border-b border-surface-200 dark:border-surface-700">
              <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">N° Orden</th>
              <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Estado</th>
              <th class="text-right px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Subtotal</th>
              <th class="text-center px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Líneas</th>
              <th class="text-left px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Creada</th>
              <th class="text-center px-4 py-3 font-medium text-surface-600 dark:text-surface-400 text-xs uppercase tracking-wider">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-order>
            <tr class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
              <td class="px-4 py-3 font-mono text-sm text-surface-700 dark:text-surface-300 cursor-pointer" (click)="openDetail(order.id)">{{ order.orderNumber }}</td>
              <td class="px-4 py-3">
                <p-tag [value]="order.status" [severity]="statusSeverity(order.status)" />
              </td>
              <td class="px-4 py-3 text-right font-medium tabular-nums">{{ order.subtotal | currency:'USD ' }}</td>
              <td class="px-4 py-3 text-center text-sm text-surface-600 dark:text-surface-400">{{ order.lineCount }}</td>
              <td class="px-4 py-3 text-sm text-surface-500">{{ order.createdAt | date:'dd/MM/yyyy' }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <p-button
                    icon="pi pi-eye"
                    (onClick)="openDetail(order.id)"
                    severity="secondary"
                    [text]="true"
                    [rounded]="true"
                    pTooltip="Ver detalle"
                  />
                  @if (order.status === 'DRAFT') {
                    <p-button
                      icon="pi pi-check"
                      (onClick)="confirmOrder(order.id)"
                      severity="success"
                      [text]="true"
                      [rounded]="true"
                      pTooltip="Confirmar orden"
                    />
                    <p-button
                      icon="pi pi-times"
                      (onClick)="cancelOrder(order.id)"
                      severity="danger"
                      [text]="true"
                      [rounded]="true"
                      pTooltip="Cancelar"
                    />
                  }
                  @if (order.status === 'CONFIRMED') {
                    <p-button
                      icon="pi pi-times"
                      (onClick)="cancelOrder(order.id)"
                      severity="danger"
                      [text]="true"
                      [rounded]="true"
                      pTooltip="Cancelar"
                    />
                  }
                </div>
              </td>
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
          <i class="pi pi-shopping-cart text-xl text-surface-500"></i>
          <span class="text-lg font-semibold text-surface-900 dark:text-surface-100">Orden {{ detail()?.orderNumber }}</span>
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
              <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Creada</label>
              <p class="text-sm mt-1 text-surface-900 dark:text-surface-100">{{ d.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
            @if (d.invoiceNumber) {
              <div>
                <label class="text-xs font-medium text-surface-500 uppercase tracking-wider">Factura asociada</label>
                <p class="text-sm mt-1 text-surface-900 dark:text-surface-100">{{ d.invoiceNumber }}</p>
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

    <p-confirmDialog />
    <p-toast />
  `,
})
export class OrdersPageComponent {
  private readonly api = inject(OrdersApiService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly loading = signal(false);
  readonly orders = signal<PortalOrderList[]>([]);
  readonly detail = signal<PortalOrderDetail | null>(null);
  readonly detailDialogVisible = signal(false);

  constructor() {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.loading.set(true);
    this.api.list().pipe(
      tap(response => {
        this.orders.set(response);
        this.loading.set(false);
      }),
      catchError(() => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las órdenes' });
        return of([] as PortalOrderList[]);
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
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el detalle de la orden' });
        return of(null as unknown as PortalOrderDetail);
      }),
    ).subscribe();
  }

  confirmOrder(id: string): void {
    this.api.confirm(id).pipe(
      tap(() => {
        this.messageService.add({ severity: 'success', summary: 'Confirmada', detail: 'Orden confirmada exitosamente' });
        this.loadOrders();
      }),
      catchError(() => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo confirmar la orden' });
        return of(void 0);
      }),
    ).subscribe();
  }

  cancelOrder(id: string): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de cancelar esta orden?',
      header: 'Confirmar Cancelación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'Volver',
      accept: () => {
        this.api.cancel(id, 'Cancelado por el cliente').pipe(
          tap(() => {
            this.messageService.add({ severity: 'info', summary: 'Cancelada', detail: 'Orden cancelada' });
            this.loadOrders();
          }),
          catchError(() => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cancelar la orden' });
            return of(void 0);
          }),
        ).subscribe();
      },
    });
  }

  statusSeverity(status: string): StatusSeverity {
    const map: Record<string, StatusSeverity> = {
      DRAFT: 'info',
      CONFIRMED: 'success',
      INVOICED: 'info',
      CANCELLED: 'danger',
    };
    return map[status] ?? 'info';
  }
}
