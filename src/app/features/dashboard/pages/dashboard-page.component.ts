import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthService } from '@features/auth/services/application/auth.service';
import { DashboardService } from '@features/dashboard/services/application/dashboard.service';
import { PortalDashboard } from '@features/dashboard/models';
import { getStatusLabel } from '@shared/utils/status-labels';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

type Severity = 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast';

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  route: string;
  gradient: string;
  format?: string;
  prefix?: string;
  suffix?: string;
}

const THOUSAND = 1000;

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, DecimalPipe, TagModule, RouterLink, ButtonModule, SkeletonModule, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  readonly loading = this.dashboardService.loading;
  readonly dashboard = this.dashboardService.dashboard;

  readonly customerName = computed(() => this.authService.currentUser()?.legalName ?? 'Cliente');

  readonly getStatusLabel = getStatusLabel;

  readonly quickActions = [
    { label: 'Nuevo Presupuesto', desc: 'Solicitar presupuesto', icon: 'pi pi-file-edit', route: '/quotes', bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
    { label: 'Mis Pedidos', desc: 'Ver pedidos activos', icon: 'pi pi-shopping-cart', route: '/orders', bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
    { label: 'Pagar Facturas', desc: 'Saldos pendientes', icon: 'pi pi-credit-card', route: '/payments', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
    { label: 'Mi Perfil', desc: 'Datos de cuenta', icon: 'pi pi-user', route: '/profile', bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' },
  ];

  constructor() {
    this.dashboardService.load();
  }

  buildStats(data: PortalDashboard): StatCard[] {
    return [
      { label: 'Presupuestos Activos', value: String(data.draftQuotes), icon: 'pi pi-file-edit', route: '/quotes', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
      { label: 'Pedidos Confirmados', value: String(data.confirmedOrders), icon: 'pi pi-shopping-cart', route: '/orders', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
      { label: 'Facturas Pendientes', value: String(data.pendingInvoices), icon: 'pi pi-receipt', route: '/invoices', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
      this.pendingAmountCard(data.pendingAmount),
    ];
  }

  private pendingAmountCard(amount: number): StatCard {
    if (amount >= THOUSAND) {
      return {
        label: 'Monto Pendiente',
        value: amount / THOUSAND,
        icon: 'pi pi-dollar',
        route: '/invoices',
        gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
        format: '1.0-1',
        prefix: '$',
        suffix: 'k',
      };
    }
    return {
      label: 'Monto Pendiente',
      value: amount,
      icon: 'pi pi-dollar',
      route: '/invoices',
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      format: '1.0-0',
      prefix: '$',
    };
  }

  activityTypeLabel(type: string): string {
    const map: Record<string, string> = { QUOTE: 'Presupuesto', ORDER: 'Pedido', INVOICE: 'Factura', PAYMENT: 'Pago' };
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
