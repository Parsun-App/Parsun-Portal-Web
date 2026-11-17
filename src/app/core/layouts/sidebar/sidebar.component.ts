import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';
import { PortalSidebarService } from '@core/layouts/portal-sidebar.service';
import { PORTAL_MODULE_COLORS } from '@shared/utils/module-colors';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DrawerModule, TooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./sidebar.component.css'],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  readonly sidebar = inject(PortalSidebarService);

  readonly menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-chart-line',
      route: '/dashboard',
      color: PORTAL_MODULE_COLORS.dashboard.icon,
    },
    {
      label: 'Productos',
      icon: 'pi pi-box',
      route: '/products',
      color: PORTAL_MODULE_COLORS.products.icon,
    },
    {
      label: 'Presupuestos',
      icon: 'pi pi-file-edit',
      route: '/quotes',
      color: PORTAL_MODULE_COLORS.quotes.icon,
    },
    {
      label: 'Pedidos',
      icon: 'pi pi-shopping-cart',
      route: '/orders',
      color: PORTAL_MODULE_COLORS.orders.icon,
    },
    {
      label: 'Facturas',
      icon: 'pi pi-file',
      route: '/invoices',
      color: PORTAL_MODULE_COLORS.invoices.icon,
    },
    {
      label: 'Historial de pagos',
      icon: 'pi pi-credit-card',
      route: '/payments',
      color: PORTAL_MODULE_COLORS.payments.icon,
    },
  ];
}
