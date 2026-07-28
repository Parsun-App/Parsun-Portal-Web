import { Component, ChangeDetectionStrategy, inject, signal, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../../features/auth/services/application/auth.service';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

const DARK_MODE_CLASS = 'my-app-dark';
const DARK_MODE_KEY = 'darkMode';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonModule, TooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="flex items-center justify-end h-16 px-4 md:px-6 bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700">
      <div class="flex items-center gap-1">
        <p-button
          [icon]="isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'"
          (onClick)="toggleDarkMode()"
          severity="secondary"
          [text]="true"
          [rounded]="true"
          pTooltip="Cambiar tema"
        />
        <p-button
          icon="pi pi-sign-out"
          (onClick)="logout()"
          severity="danger"
          [text]="true"
          [rounded]="true"
          pTooltip="Cerrar sesión"
        />
      </div>
    </header>
  `,
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly isDarkMode = signal(false);

  constructor() {
    afterNextRender(() => {
      this.isDarkMode.set(this.readStoredDarkMode());
    });
  }

  private readStoredDarkMode(): boolean {
    if (!this.isBrowser) return false;
    const stored = localStorage.getItem(DARK_MODE_KEY);
    if (stored !== null) return stored === 'true';
    return document.documentElement.classList.contains(DARK_MODE_CLASS);
  }

  toggleDarkMode(): void {
    const newVal = !this.isDarkMode();
    this.isDarkMode.set(newVal);
    if (this.isBrowser) {
      document.documentElement.classList.toggle(DARK_MODE_CLASS, newVal);
      localStorage.setItem(DARK_MODE_KEY, String(newVal));
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
