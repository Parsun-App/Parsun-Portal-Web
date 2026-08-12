import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '@features/auth/services/application/auth.service';
import { HeaderComponent } from '@core/layouts/header/header.component';
import { NotificationApiService, AppNotification } from '@core/notifications/services/api/notification-api.service';
import { NotificationDestinationResolver } from '@core/notifications/services/navigation/notification-destination.resolver';
import { NotificationWebSocketService } from '@core/notifications/services/websocket/notification-websocket.service';

describe('HeaderComponent', () => {
  it('delegates logout to authentication', () => {
    const logout = vi.fn();
    TestBed.configureTestingModule({ imports: [HeaderComponent], providers: [provideRouter([]), { provide: AuthService, useValue: { logout, accessToken: signal(null) } }, { provide: NotificationApiService, useValue: { getUnreadCount: vi.fn(() => of({ count: 0 })), list: vi.fn(() => of([])) } }, { provide: NotificationWebSocketService, useValue: { connect: vi.fn(), notification$: new Subject<AppNotification>() } }, { provide: NotificationDestinationResolver, useValue: {} }] });
    const component = TestBed.createComponent(HeaderComponent).componentInstance;
    component.logout();
    expect(logout).toHaveBeenCalledOnce();
  });
});
