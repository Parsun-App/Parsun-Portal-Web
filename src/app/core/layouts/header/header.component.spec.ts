import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '@features/auth/services/application/auth.service';
import { HeaderComponent } from '@core/layouts/header/header.component';
import {
  NotificationApiService,
  AppNotification,
} from '@core/notifications/services/api/notification-api.service';
import { NotificationDestinationResolver } from '@core/notifications/services/navigation/notification-destination.resolver';
import { NotificationWebSocketService } from '@core/notifications/services/websocket/notification-websocket.service';

function configure(auth: Record<string, unknown>): void {
  TestBed.configureTestingModule({
    imports: [HeaderComponent],
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: auth },
      {
        provide: NotificationApiService,
        useValue: { getUnreadCount: vi.fn(() => of({ count: 0 })), list: vi.fn(() => of([])) },
      },
      {
        provide: NotificationWebSocketService,
        useValue: { connect: vi.fn(), notification$: new Subject<AppNotification>() },
      },
      { provide: NotificationDestinationResolver, useValue: {} },
    ],
  });
}

describe('HeaderComponent', () => {
  it('delegates logout to authentication', () => {
    const logout = vi.fn();
    configure({ logout, accessToken: signal(null), currentUser: signal(null) });
    const component = TestBed.createComponent(HeaderComponent).componentInstance;
    component.logout();
    expect(logout).toHaveBeenCalledOnce();
  });

  it('navigates to the profile page from the user menu', () => {
    configure({ logout: vi.fn(), accessToken: signal(null), currentUser: signal(null) });
    const component = TestBed.createComponent(HeaderComponent).componentInstance;
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    component.goToProfile();

    expect(navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('builds the avatar initials from the customer legal name', () => {
    configure({
      logout: vi.fn(),
      accessToken: signal(null),
      currentUser: signal({ legalName: 'Inversiones Global S.A.', rif: 'J-99999999-9' }),
    });
    const component = TestBed.createComponent(HeaderComponent).componentInstance;

    expect(component.initials()).toBe('IG');
  });

  it('applies the dark mode from the profile menu', () => {
    configure({ logout: vi.fn(), accessToken: signal(null), currentUser: signal(null) });
    const component = TestBed.createComponent(HeaderComponent).componentInstance;

    component.setDarkMode(true);

    expect(component.isDarkMode()).toBe(true);
  });
});
