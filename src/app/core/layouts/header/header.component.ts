import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { AuthService } from '../../../features/auth/services/application/auth.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="flex items-center justify-between h-16 px-6 bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700">
      <div>
        @if (currentUser(); as user) {
          <span class="text-sm font-medium text-surface-700 dark:text-surface-300">
            {{ user.legalName }}
          </span>
          <span class="ml-2 text-xs text-surface-400">· {{ user.rif }}</span>
        }
      </div>
      <div class="flex items-center gap-2">
        <p-button
          [icon]="isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'"
          (onClick)="toggleDarkMode()"
          severity="secondary"
          [text]="true"
          [rounded]="true"
        />
        <p-button
          icon="pi pi-sign-out"
          (onClick)="logout()"
          severity="secondary"
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

  readonly currentUser = this.authService.currentUser;
  readonly isDarkMode = signal(this.checkDarkMode());

  private checkDarkMode(): boolean {
    return document.documentElement.classList.contains('my-app-dark');
  }

  toggleDarkMode(): void {
    const newVal = !this.isDarkMode();
    this.isDarkMode.set(newVal);
    document.documentElement.classList.toggle('my-app-dark', newVal);
    localStorage.setItem('darkMode', String(newVal));
  }

  logout(): void {
    this.authService.logout();
  }
}
