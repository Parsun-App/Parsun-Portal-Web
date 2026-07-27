import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
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
  imports: [RouterLink, RouterLinkActive, ButtonModule, DrawerModule, TooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Mobile hamburger trigger -->
    <button
      (click)="mobileOpen.set(true)"
      class="md:hidden fixed top-3 left-3 z-50 w-10 h-10 flex items-center justify-center rounded-lg bg-surface-0 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-sm text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
    >
      <i class="pi pi-bars text-lg"></i>
    </button>

    <!-- Desktop sidebar -->
    <aside
      [class.w-64]="!collapsed()"
      [class.w-16]="collapsed()"
      class="hidden md:flex flex-col bg-surface-0 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 transition-all duration-300"
    >
      <!-- Logo -->
      <div class="flex items-center h-16 px-3 border-b border-surface-200 dark:border-surface-700" [class.justify-center]="collapsed()">
        @if (!collapsed()) {
          <img src="/logo.png" alt="Parsun" class="h-10 w-auto" />
        } @else {
          <span class="text-xl font-bold text-primary">P</span>
        }
      </div>

      <!-- Toggle -->
      <div class="flex justify-end px-2 pt-2">
        <p-button
          [icon]="collapsed() ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"
          (onClick)="toggleCollapsed()"
          severity="secondary"
          [text]="true"
          [rounded]="true"
        />
      </div>

      <!-- Menu items -->
      <nav class="flex flex-col gap-1 px-2 mt-1 flex-1">
        @for (item of menuItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="font-semibold text-primary bg-primary/10 dark:bg-primary/20"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
            [class.justify-center]="collapsed()"
            [pTooltip]="collapsed() ? item.label : ''"
            tooltipPosition="right"
          >
            <i [class]="item.icon" class="text-lg"></i>
            @if (!collapsed()) {
              <span class="text-sm">{{ item.label }}</span>
            }
          </a>
        }
      </nav>
    </aside>

    <!-- Mobile drawer -->
    <p-drawer [(visible)]="mobileOpen" position="left" styleClass="w-72">
      <ng-template pTemplate="header">
        <img src="/logo.png" alt="Parsun" class="h-9 w-auto" />
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
  readonly collapsed = signal(false);
  readonly mobileOpen = signal(false);

  readonly menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Productos', icon: 'pi pi-box', route: '/products' },
    { label: 'Cotizaciones', icon: 'pi pi-file-edit', route: '/quotes' },
    { label: 'Órdenes', icon: 'pi pi-shopping-cart', route: '/orders' },
    { label: 'Facturas', icon: 'pi pi-receipt', route: '/invoices' },
    { label: 'Pagos', icon: 'pi pi-credit-card', route: '/payments' },
    { label: 'Mi Perfil', icon: 'pi pi-user', route: '/profile' },
  ];

  toggleCollapsed(): void {
    this.collapsed.update(v => !v);
  }
}
