import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
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
  readonly mobileOpen = signal(false);

  readonly menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Productos', icon: 'pi pi-box', route: '/products' },
    { label: 'Presupuestos', icon: 'pi pi-file-edit', route: '/quotes' },
    { label: 'Pedidos', icon: 'pi pi-shopping-cart', route: '/orders' },
    { label: 'Facturas', icon: 'pi pi-receipt', route: '/invoices' },
    { label: 'Historial de pagos', icon: 'pi pi-credit-card', route: '/payments' },
    { label: 'Mi Perfil', icon: 'pi pi-user', route: '/profile' },
  ];
}
