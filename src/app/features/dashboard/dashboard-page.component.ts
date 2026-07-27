import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { catchError, of, tap } from 'rxjs';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RouterLink } from '@angular/router';
import { DashboardApiService } from './services/api/dashboard-api.service';
import { PortalDashboard, PortalRecentActivity } from '@shared/models';

type Severity = 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, TagModule, ProgressSpinnerModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-6">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-100">Dashboard</h1>
        <p class="text-surface-500 mt-1">Resumen de tu actividad comercial.</p>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <i class="pi pi-spin pi-spinner text-3xl text-surface-400"></i>
        </div>
      } @else if (dashboard(); as data) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a routerLink="/quotes" class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-5 hover:shadow-sm transition-shadow block">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <i class="pi pi-file-edit text-blue-600 dark:text-blue-400"></i>
              </div>
              <div>
                <p class="text-2xl font-bold text-surface-900 dark:text-surface-100">{{ data.draftQuotes }}</p>
                <p class="text-xs text-surface-500">Cotizaciones Activas</p>
              </div>
            </div>
          </a>

          <a routerLink="/orders" class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-5 hover:shadow-sm transition-shadow block">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <i class="pi pi-shopping-cart text-green-600 dark:text-green-400"></i>
              </div>
              <div>
                <p class="text-2xl font-bold text-surface-900 dark:text-surface-100">{{ data.confirmedOrders }}</p>
                <p class="text-xs text-surface-500">Órdenes Confirmadas</p>
              </div>
            </div>
          </a>

          <a routerLink="/invoices" class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-5 hover:shadow-sm transition-shadow block">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <i class="pi pi-file-invoice text-amber-600 dark:text-amber-400"></i>
              </div>
              <div>
                <p class="text-2xl font-bold text-surface-900 dark:text-surface-100">{{ data.pendingInvoices }}</p>
                <p class="text-xs text-surface-500">Facturas Pendientes</p>
              </div>
            </div>
          </a>

          <a routerLink="/invoices" class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-5 hover:shadow-sm transition-shadow block">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <i class="pi pi-dollar text-red-600 dark:text-red-400"></i>
              </div>
              <div>
                <p class="text-2xl font-bold text-surface-900 dark:text-surface-100">{{ data.pendingAmount | currency:'Bs. ' }}</p>
                <p class="text-xs text-surface-500">Monto Pendiente</p>
              </div>
            </div>
          </a>
        </div>

        @if (data.recentActivity && data.recentActivity.length > 0) {
          <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800">
            <div class="px-6 py-4 border-b border-surface-200 dark:border-surface-700">
              <h2 class="text-base font-semibold text-surface-900 dark:text-surface-100">Actividad Reciente</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-surface-200 dark:border-surface-700">
                    <th class="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Tipo</th>
                    <th class="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Número</th>
                    <th class="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Fecha</th>
                    <th class="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Estado</th>
                    <th class="text-right px-6 py-3 text-xs font-medium text-surface-500 uppercase tracking-wider">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of data.recentActivity; track item.number) {
                    <tr class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                      <td class="px-6 py-3 text-sm text-surface-700 dark:text-surface-300">{{ activityTypeLabel(item.type) }}</td>
                      <td class="px-6 py-3 text-sm font-mono text-surface-900 dark:text-surface-100">{{ item.number }}</td>
                      <td class="px-6 py-3 text-sm text-surface-600 dark:text-surface-400">{{ item.date | date:'dd/MM/yyyy' }}</td>
                      <td class="px-6 py-3">
                        <p-tag [value]="item.status" [severity]="activityStatusSeverity(item.status)" />
                      </td>
                      <td class="px-6 py-3 text-right text-sm font-medium tabular-nums">{{ item.amount | currency:'Bs. ' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class DashboardPageComponent {
  private readonly api = inject(DashboardApiService);

  readonly loading = signal(false);
  readonly dashboard = signal<PortalDashboard | null>(null);

  constructor() {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.api.getDashboard().pipe(
      tap(data => {
        this.dashboard.set(data);
        this.loading.set(false);
      }),
      catchError(() => {
        this.loading.set(false);
        return of(null as unknown as PortalDashboard);
      }),
    ).subscribe();
  }

  activityTypeLabel(type: string): string {
    const map: Record<string, string> = {
      QUOTE: 'Cotización',
      ORDER: 'Orden',
      INVOICE: 'Factura',
      PAYMENT: 'Pago',
    };
    return map[type] ?? type;
  }

  activityStatusSeverity(status: string): Severity {
    const map: Record<string, Severity> = {
      DRAFT: 'info',
      CONFIRMED: 'success',
      PAID: 'success',
      APPLIED: 'success',
      PENDING_PAYMENT: 'warn',
      PENDING: 'warn',
      CANCELLED: 'danger',
      OVERDUE: 'danger',
    };
    return map[status] ?? 'info';
  }
}
