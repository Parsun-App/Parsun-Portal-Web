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
  styles: [`:host { display: flex; height: 100%; }`],
  template: `
    <button
      (click)="mobileOpen.set(true)"
      class="md:hidden fixed top-3 left-3 z-50 w-11 h-11 flex items-center justify-center rounded-xl bg-surface-0/90 dark:bg-surface-800/90 backdrop-blur-sm border border-surface-200/60 dark:border-surface-700/60 shadow-md hover:shadow-lg text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700 transition-all duration-200 active:scale-95"
    >
      <i class="pi pi-bars text-xl"></i>
    </button>

    <aside class="hidden md:flex flex-col h-full w-16 bg-surface-0 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 transition-all duration-300">
      <div class="flex items-center justify-center h-16 px-3 border-b border-surface-200 dark:border-surface-700">
        <span class="text-xl font-bold text-primary">P</span>
      </div>

      <nav class="flex flex-col gap-1 px-2 mt-3 flex-1">
        @for (item of menuItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="font-semibold text-primary bg-primary/10 dark:bg-primary/20"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center justify-center px-3 py-2.5 rounded-lg text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
            [pTooltip]="item.label"
            tooltipPosition="right"
          >
            <i [class]="item.icon" class="text-lg"></i>
          </a>
        }
      </nav>
    </aside>

    <p-drawer [(visible)]="mobileOpen" position="left" styleClass="w-72">
      <ng-template pTemplate="header">
        <img src="/Parsun.png" alt="Parsun" class="h-10 w-auto" />
      </ng-template>
      <nav class="flex flex-col gap-1 mt-2">
        @for (item of menuItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="font-semibold text-primary bg-primary/10 dark:bg-primary/20"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            (click)="mobileOpen.set(false)"
          >
            <i [class]="item.icon" class="text-lg"></i>
            <span class="text-sm">{{ item.label }}</span>
          </a>
        }
      </nav>
    </p-drawer>
  `,
})
export class SidebarComponent {
  readonly mobileOpen = signal(false);

  readonly menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Productos', icon: 'pi pi-box', route: '/products' },
    { label: 'Presupuestos', icon: 'pi pi-file-edit', route: '/quotes' },
    { label: 'Órdenes', icon: 'pi pi-shopping-cart', route: '/orders' },
    { label: 'Facturas', icon: 'pi pi-receipt', route: '/invoices' },
    { label: 'Pagos', icon: 'pi pi-credit-card', route: '/payments' },
    { label: 'Mi Perfil', icon: 'pi pi-user', route: '/profile' },
  ];
}
