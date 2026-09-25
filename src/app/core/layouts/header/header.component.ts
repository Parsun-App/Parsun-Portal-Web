import { Component, inject, signal, afterNextRender } from '@angular/core';
import { CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '@features/auth/services/application/auth.service';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { NotificationBellComponent } from '@core/notifications/components/notification-bell/notification-bell.component';
import {
  PortalCartMode,
  PortalCartService,
} from '@features/products/services/application/portal-cart.service';
import { OrdersApiService } from '@features/orders/services/api/orders-api.service';
import { QuotesApiService } from '@features/quotes/services/api/quotes-api.service';
import { MessageService } from 'primeng/api';
import { EMPTY, Observable, catchError, finalize, tap } from 'rxjs';
import { ORDERS_MESSAGES } from '@features/orders/messages/orders.messages';
import { QUOTES_MESSAGES } from '@features/quotes/messages/quotes.messages';

const DARK_MODE_CLASS = 'my-app-dark';
const DARK_MODE_KEY = 'darkMode';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    ButtonModule,
    CurrencyPipe,
    DrawerModule,
    FormsModule,
    InputNumberModule,
    TextareaModule,
    TooltipModule,
    NotificationBellComponent,
  ],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly cart = inject(PortalCartService);
  private readonly ordersApi = inject(OrdersApiService);
  private readonly quotesApi = inject(QuotesApiService);
  private readonly messageService = inject(MessageService);
  readonly confirmingCart = signal(false);

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

  openCart(mode: PortalCartMode): void {
    this.cart.open(mode);
  }

  updateQuantity(productId: string, quantity: number): void {
    this.cart.updateQuantity(productId, quantity);
  }

  updateNotes(notes: string): void {
    this.cart.updateNotes(notes);
  }

  remove(productId: string): void {
    this.cart.remove(productId);
  }

  buildPhotoUrl(photo: string | null): string | null {
    return photo ? `/api/files/${photo}` : null;
  }

  confirmCart(): void {
    if (this.confirmingCart() || this.cart.lines().length === 0) return;
    const mode = this.cart.mode();
    const request = {
      lines: this.cart.lines().map((line) => ({
        productId: line.product.id,
        quantity: line.quantity,
        unitPrice: line.product.price,
      })),
      notes: this.cart.notes().trim() || undefined,
    };
    this.confirmingCart.set(true);
    const creation$: Observable<unknown> =
      mode === 'order' ? this.ordersApi.create(request) : this.quotesApi.create(request);
    creation$
      .pipe(
        tap(() => {
          this.cart.clear(mode);
          this.cart.visible.set(false);
          this.messageService.add(
            mode === 'order' ? ORDERS_MESSAGES.createSuccess : QUOTES_MESSAGES.createSuccess,
          );
        }),
        catchError(() => {
          this.messageService.add(
            mode === 'order' ? ORDERS_MESSAGES.createError : QUOTES_MESSAGES.createError,
          );
          return EMPTY;
        }),
        finalize(() => this.confirmingCart.set(false)),
      )
      .subscribe();
  }
}
