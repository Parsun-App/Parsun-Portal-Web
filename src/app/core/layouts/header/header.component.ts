import { Component, ChangeDetectionStrategy, inject, signal, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../../features/auth/services/application/auth.service';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationBellComponent } from '../../notifications/components/notification-bell/notification-bell.component';

const DARK_MODE_CLASS = 'my-app-dark';
const DARK_MODE_KEY = 'darkMode';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonModule, TooltipModule, NotificationBellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly isDarkMode = signal(false);

  constructor() {
    afterNextRender(() => {
      const dark = this.readStoredDarkMode();
      this.isDarkMode.set(dark);
      if (this.isBrowser) {
        document.documentElement.classList.toggle(DARK_MODE_CLASS, dark);
      }
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
