import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, ButtonModule, DrawerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Desktop sidebar -->
    <aside
      [class.w-64]="!collapsed()"
      [class.w-16]="collapsed()"
      class="hidden md:flex flex-col bg-surface-0 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 transition-all duration-300"
    >
      <!-- Logo -->
      <div class="flex items-center justify-center h-16 border-b border-surface-200 dark:border-surface-700">
        @if (!collapsed()) {
          <span class="text-2xl font-bold tracking-tight">Parsun</span>
        } @else {
          <span class="text-2xl font-bold">P</span>
        }
      </div>

      <!-- Toggle -->
      <p-button
        [icon]="collapsed() ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"
        (onClick)="toggleCollapsed()"
        severity="secondary"
        [text]="true"
        [rounded]="true"
      />

      <!-- Menu items -->
      <nav class="flex flex-col gap-1 px-2">
        @for (item of menuItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="font-semibold text-primary"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
            [class.justify-center]="collapsed()"
          >
            <i [class]="item.icon" class="text-lg"></i>
            @if (!collapsed()) {
              <span class="text-sm">{{ item.label }}</span>
            }
          </a>
        }
      </nav>
    </aside>

    <!-- Mobile drawer trigger -->
    <p-button
      icon="pi pi-bars"
      (onClick)="mobileOpen.set(true)"
      severity="secondary"
      [rounded]="true"
    />

    <!-- Mobile drawer -->
    <p-drawer [(visible)]="mobileOpen" position="left" styleClass="w-72">
      <ng-template pTemplate="header">
        <span class="text-2xl font-bold tracking-tight">Parsun</span>
      </ng-template>
      <nav class="flex flex-col gap-1">
        @for (item of menuItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="font-semibold text-primary bg-surface-100 dark:bg-surface-800"
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
    { label: 'Facturas', icon: 'pi pi-file-invoice', route: '/invoices' },
    { label: 'Pagos', icon: 'pi pi-credit-card', route: '/payments' },
    { label: 'Mi Perfil', icon: 'pi pi-user', route: '/profile' },
  ];

  toggleCollapsed(): void {
    this.collapsed.update(v => !v);
  }
}
