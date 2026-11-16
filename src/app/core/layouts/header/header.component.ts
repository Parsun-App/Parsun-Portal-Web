import {
  Component,
  inject,
  signal,
  computed,
  afterNextRender,
  ViewChild,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@features/auth/services/application/auth.service';
import { Popover, PopoverModule } from 'primeng/popover';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { NotificationBellComponent } from '@core/notifications/components/notification-bell/notification-bell.component';

const DARK_MODE_CLASS = 'my-app-dark';
const DARK_MODE_KEY = 'darkMode';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, PopoverModule, ToggleSwitchModule, NotificationBellComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly currentUser = this.authService.currentUser;

  @ViewChild('userMenu') userMenu!: Popover;

  readonly isDarkMode = signal(false);
  readonly initials = computed(() => {
    const name = this.currentUser()?.legalName?.trim();
    if (!name) return 'P';
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  });

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

  setDarkMode(enabled: boolean): void {
    this.isDarkMode.set(enabled);
    if (this.isBrowser) {
      document.documentElement.classList.toggle(DARK_MODE_CLASS, enabled);
      localStorage.setItem(DARK_MODE_KEY, String(enabled));
    }
  }

  logout(): void {
    this.userMenu?.hide();
    this.authService.logout();
  }

  toggleUserMenu(event: Event): void {
    this.userMenu.toggle(event);
  }

  goToProfile(): void {
    this.userMenu?.hide();
    void this.router.navigate(['/profile']);
  }
}
