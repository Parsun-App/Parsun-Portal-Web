import {
  Component,
  inject,
  ChangeDetectionStrategy,
  computed,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthService } from '@features/auth/services/application/auth.service';
import { DashboardService } from '@features/dashboard/services/application/dashboard.service';
import { QuotesService } from '@features/quotes/services/application/quotes.service';
import { OrdersService } from '@features/orders/services/application/orders.service';
import { ProductsApiService } from '@features/products/services/api/products-api.service';
import { QuotesPageComponent } from '@features/quotes/pages/quotes-page.component';
import { OrdersPageComponent } from '@features/orders/pages/orders-page.component';
import { merge, Subject, takeUntil } from 'rxjs';
import { PortalDashboard } from '@features/dashboard/models';
import { getStatusLabel } from '@shared/utils/status-labels';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { MetricCardComponent } from '@shared/components/ui';
import { PORTAL_MODULE_COLORS } from '@shared/utils/module-colors';

type Severity = 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast';

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  route: string;
  gradient: string;
  isCurrency?: boolean;
}

interface QuickAction {
  label: string;
  desc: string;
  icon: string;
  bg: string;
  color: string;
  link?: string;
  action?: () => void;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    TagModule,
    RouterLink,
    ButtonModule,
    SkeletonModule,
    EmptyStateComponent,
    MetricCardComponent,
    QuotesPageComponent,
    OrdersPageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent implements OnInit {
  private readonly destroy$ = new Subject<void>();
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);
  readonly quotesService = inject(QuotesService);
  readonly ordersService = inject(OrdersService);
  private readonly productsApi = inject(ProductsApiService);

  ngOnInit(): void {
    this.dashboardService.load();
    merge(this.quotesService.created$, this.ordersService.created$)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.dashboardService.load();
      });
  }

  readonly loading = this.dashboardService.loading;
  readonly dashboard = this.dashboardService.dashboard;
  readonly downloadingCatalog = signal(false);

  readonly customerName = computed(() => this.authService.currentUser()?.legalName ?? 'Cliente');
  readonly getStatusLabel = getStatusLabel;

  readonly quickActions: QuickAction[] = [
    {
      label: 'Descargar Catálogo',
      desc: 'Catálogo en PDF',
      icon: 'pi pi-download',
      bg: PORTAL_MODULE_COLORS.products.background,
      color: PORTAL_MODULE_COLORS.products.icon,
      action: () => this.downloadCatalog(),
    },
    {
      label: 'Agregar Presupuesto',
      desc: 'Crear nuevo presupuesto',
      icon: 'pi pi-file-edit',
      bg: PORTAL_MODULE_COLORS.quotes.background,
      color: PORTAL_MODULE_COLORS.quotes.icon,
      action: () => this.quotesService.requestCreateDialog(),
    },
    {
      label: 'Agregar Pedido',
      desc: 'Crear nuevo pedido',
      icon: 'pi pi-shopping-cart',
      bg: PORTAL_MODULE_COLORS.orders.background,
      color: PORTAL_MODULE_COLORS.orders.icon,
      action: () => this.ordersService.requestCreateDialog(),
    },
    {
      label: 'Ver Pagos Pendientes',
      desc: 'Facturas por pagar',
      icon: 'pi pi-file',
      bg: PORTAL_MODULE_COLORS.invoices.background,
      color: PORTAL_MODULE_COLORS.invoices.icon,
      link: '/invoices',
    },
    {
      label: 'Agregar Pago',
      desc: 'Registrar un pago',
      icon: 'pi pi-credit-card',
      bg: PORTAL_MODULE_COLORS.payments.background,
      color: PORTAL_MODULE_COLORS.payments.icon,
      link: '/payments',
    },
  ];

  constructor() {
    this.dashboardService.load();
  }

  downloadCatalog(): void {
    this.downloadingCatalog.set(true);
    this.productsApi.downloadCatalogPdf().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'catalogo-comercial.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingCatalog.set(false);
      },
      error: () => this.downloadingCatalog.set(false),
    });
  }

  buildStats(data: PortalDashboard): StatCard[] {
    return [
      {
        label: 'Presupuestos Pendientes',
        value: String(data.draftQuotes),
        icon: 'pi pi-file-edit',
        route: '/quotes',
        gradient: 'linear-gradient(135deg, #1e40af, #2563eb)',
      },
      {
        label: 'Pedidos Pendientes',
        value: String(data.pendingOrders),
        icon: 'pi pi-shopping-cart',
        route: '/orders',
        gradient: 'linear-gradient(135deg, #2563eb, #1e40af)',
      },
      {
        label: 'Facturas Pendientes',
        value: String(data.pendingInvoices),
        icon: 'pi pi-file',
        route: '/invoices',
        gradient: 'linear-gradient(135deg, #b91c2c, #dc2626)',
      },
      this.pendingAmountCard(data.pendingAmount),
    ];
  }

  private pendingAmountCard(amount: number): StatCard {
    return {
      label: 'Monto Pendiente',
      value: amount,
      icon: 'pi pi-dollar',
      route: '/invoices',
      gradient: 'linear-gradient(135deg, #dc2626, #b91c2c)',
      isCurrency: true,
    };
  }

  activityTypeLabel(type: string): string {
    const map: Record<string, string> = {
      QUOTE: 'Presupuesto',
      ORDER: 'Pedido',
      INVOICE: 'Factura',
      PAYMENT: 'Pago',
    };
    return map[type] ?? type;
  }

  activityColor(type: string): string {
    const map: Record<string, string> = {
      QUOTE: '#1e40af',
      ORDER: '#2563eb',
      INVOICE: '#b91c2c',
      PAYMENT: '#dc2626',
    };
    return map[type] ?? '#6b7280';
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
