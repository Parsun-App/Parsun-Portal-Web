import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthService } from '../auth/services/application/auth.service';
import { PortalDashboard } from '@shared/models';

type Severity = 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  route: string;
  gradient: string;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, DecimalPipe, TagModule, RouterLink, ButtonModule, SkeletonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-8 animate-fade-in">
      <!-- Welcome Hero -->
      <div class="rounded-2xl bg-zinc-950 p-8 md:p-10 text-white">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p class="text-zinc-400 text-sm font-medium mb-1">Panel de Control</p>
            <h1 class="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              ¡Bienvenido, {{ customerName() }}!
            </h1>
            <p class="text-zinc-400 max-w-lg text-base">
              Aquí tienes un resumen de tu actividad comercial. Gestiona tus presupuestos, órdenes y pagos desde un solo lugar.
            </p>
          </div>
          <div class="flex gap-3 shrink-0">
            <a routerLink="/quotes">
              <p-button label="Nuevo Presupuesto" icon="pi pi-plus" styleClass="bg-white text-zinc-900 border-white hover:bg-zinc-100 font-medium px-5" />
            </a>
            <a routerLink="/products">
              <p-button label="Ver Productos" icon="pi pi-box" [outlined]="true" styleClass="border-white/30 text-white hover:bg-white/10 font-medium px-5" />
            </a>
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="rounded-xl border border-surface-200 dark:border-surface-700 p-5">
              <p-skeleton width="3rem" height="3rem" borderRadius="0.75rem" />
              <p-skeleton width="60%" height="1.5rem" styleClass="mt-3" />
              <p-skeleton width="40%" height="0.875rem" styleClass="mt-2" />
            </div>
          }
        </div>
      } @else if (dashboard(); as data) {
        <!-- Stats Grid -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-100">Resumen</h2>
            <span class="text-xs text-surface-400">Actualizado hoy</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (card of buildStats(data); track card.label) {
              <a [routerLink]="card.route" class="group relative overflow-hidden rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div class="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity rounded-full -translate-y-1/3 translate-x-1/3" [style.background]="card.gradient"></div>
                <div class="flex items-start justify-between">
                  <div>
                    <p class="text-2xl font-bold text-surface-900 dark:text-surface-100 tracking-tight">{{ card.value }}</p>
                    <p class="text-xs text-surface-500 mt-1 font-medium">{{ card.label }}</p>
                  </div>
                  <div class="w-11 h-11 rounded-xl flex items-center justify-center text-lg" [style.background]="card.gradient" [style.color]="'white'">
                    <i [class]="card.icon"></i>
                  </div>
                </div>
              </a>
            }
          </div>
        </div>

        <!-- Recent Activity + Quick Links -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Activity Table -->
          <div class="lg:col-span-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 overflow-hidden">
            <div class="px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
              <div>
                <h2 class="text-base font-semibold text-surface-900 dark:text-surface-100">Actividad Reciente</h2>
                <p class="text-xs text-surface-400 mt-0.5">Últimos movimientos de tu cuenta</p>
              </div>
              <p-button label="Ver Todo" [text]="true" size="small" icon="pi pi-arrow-right" iconPos="right" />
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-surface-50 dark:bg-surface-900/50">
                    <th class="text-left px-6 py-2.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Tipo</th>
                    <th class="text-left px-6 py-2.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Referencia</th>
                    <th class="text-left px-6 py-2.5 text-xs font-semibold text-surface-500 uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                    <th class="text-left px-6 py-2.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Estado</th>
                    <th class="text-right px-6 py-2.5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Monto</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-100 dark:divide-surface-800">
                  @for (item of data.recentActivity ?? []; track item.number; let i = $index) {
                    <tr class="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                      <td class="px-6 py-3">
                        <div class="flex items-center gap-2">
                          <span class="w-2 h-2 rounded-full" [style.background]="activityColor(item.type)"></span>
                          <span class="text-sm text-surface-700 dark:text-surface-300 font-medium">{{ activityTypeLabel(item.type) }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-3 text-sm text-surface-900 dark:text-surface-100 font-mono">{{ item.reference || item.number }}</td>
                      <td class="px-6 py-3 text-sm text-surface-500 hidden sm:table-cell">{{ item.date | date:'dd/MM/yy' }}</td>
                      <td class="px-6 py-3">
                        <p-tag [value]="item.status" [severity]="activityStatusSeverity(item.status)" [rounded]="true" styleClass="text-xs px-2 py-0.5" />
                      </td>
                      <td class="px-6 py-3 text-right text-sm font-semibold text-surface-900 dark:text-surface-100 tabular-nums whitespace-nowrap">{{ item.amount | currency:'USD':'symbol':'1.0-0' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 p-6">
            <h2 class="text-base font-semibold text-surface-900 dark:text-surface-100 mb-4">Acciones Rápidas</h2>
            <div class="flex flex-col gap-2">
              @for (action of quickActions; track action.label) {
                <a [routerLink]="action.route" class="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors group">
                  <span class="w-9 h-9 rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform" [style.background]="action.bg" [style.color]="action.color">
                    <i [class]="action.icon"></i>
                  </span>
                  <div>
                    <span class="text-sm font-medium">{{ action.label }}</span>
                    <p class="text-xs text-surface-400">{{ action.desc }}</p>
                  </div>
                  <i class="pi pi-chevron-right text-surface-300 ml-auto text-xs"></i>
                </a>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
            <i class="pi pi-chart-bar text-3xl text-surface-400"></i>
          </div>
          <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-300">Sin datos disponibles</h3>
          <p class="text-surface-500 text-sm mt-1">No se pudo cargar la información del panel.</p>
        </div>
      }
    </div>
  `,
})
export class DashboardPageComponent {
  private readonly authService = inject(AuthService);

  readonly loading = signal(true);
  readonly dashboard = signal<PortalDashboard | null>(null);

  readonly customerName = computed(() => this.authService.currentUser()?.legalName ?? 'Cliente');

  readonly quickActions = [
    { label: 'Nuevo Presupuesto', desc: 'Solicitar presupuesto', icon: 'pi pi-file-edit', route: '/quotes', bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
    { label: 'Mis Órdenes', desc: 'Ver pedidos activos', icon: 'pi pi-shopping-cart', route: '/orders', bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
    { label: 'Pagar Facturas', desc: 'Saldos pendientes', icon: 'pi pi-credit-card', route: '/payments', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
    { label: 'Mi Perfil', desc: 'Datos de cuenta', icon: 'pi pi-user', route: '/profile', bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' },
  ];

  constructor() {
    setTimeout(() => this.loadMockData(), 600);
  }

  private loadMockData(): void {
    this.dashboard.set({
      draftQuotes: 3,
      confirmedOrders: 8,
      pendingInvoices: 5,
      pendingAmount: 125000.50,
      totalProducts: 142,
      recentActivity: [
        { type: 'ORDER', number: 'ORD-2026-0042', date: '2026-07-27', status: 'CONFIRMED', amount: 45600, reference: 'Pedido mayorista' },
        { type: 'INVOICE', number: 'FAC-2026-0187', date: '2026-07-26', status: 'PENDING_PAYMENT', amount: 28750, reference: 'Factura julio' },
        { type: 'QUOTE', number: 'COT-2026-0091', date: '2026-07-25', status: 'DRAFT', amount: 12800, reference: 'Presupuesto equipos' },
        { type: 'PAYMENT', number: 'PAG-2026-0056', date: '2026-07-24', status: 'APPLIED', amount: 35000, reference: 'Transferencia' },
        { type: 'ORDER', number: 'ORD-2026-0039', date: '2026-07-23', status: 'CONFIRMED', amount: 22300, reference: 'Pedido urgente' },
        { type: 'INVOICE', number: 'FAC-2026-0180', date: '2026-07-22', status: 'PAID', amount: 15200, reference: 'Factura cancelada' },
        { type: 'QUOTE', number: 'COT-2026-0085', date: '2026-07-20', status: 'DRAFT', amount: 43000, reference: 'Presupuesto renovación' },
        { type: 'INVOICE', number: 'FAC-2026-0175', date: '2026-07-18', status: 'OVERDUE', amount: 52750, reference: 'Factura vencida' },
      ],
    });
    this.loading.set(false);
  }

  buildStats(data: PortalDashboard): StatCard[] {
    return [
      { label: 'Presupuestos Activos', value: String(data.draftQuotes), icon: 'pi pi-file-edit', route: '/quotes', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
      { label: 'Órdenes Confirmadas', value: String(data.confirmedOrders), icon: 'pi pi-shopping-cart', route: '/orders', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
      { label: 'Facturas Pendientes', value: String(data.pendingInvoices), icon: 'pi pi-file-invoice', route: '/invoices', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
      { label: 'Monto Pendiente', value: '$ ' + (data.pendingAmount / 1000).toFixed(0) + 'k', icon: 'pi pi-dollar', route: '/invoices', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
    ];
  }

  activityTypeLabel(type: string): string {
    const map: Record<string, string> = { QUOTE: 'Presupuesto', ORDER: 'Orden', INVOICE: 'Factura', PAYMENT: 'Pago' };
    return map[type] ?? type;
  }

  activityColor(type: string): string {
    const map: Record<string, string> = { QUOTE: '#3b82f6', ORDER: '#22c55e', INVOICE: '#f59e0b', PAYMENT: '#8b5cf6' };
    return map[type] ?? '#6b7280';
  }

  activityStatusSeverity(status: string): Severity {
    const map: Record<string, Severity> = {
      DRAFT: 'info', CONFIRMED: 'success', PAID: 'success', APPLIED: 'success',
      PENDING_PAYMENT: 'warn', PENDING: 'warn', CANCELLED: 'danger', OVERDUE: 'danger',
    };
    return map[status] ?? 'info';
  }
}
