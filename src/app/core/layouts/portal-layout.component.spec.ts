import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { PortalLayoutComponent } from '@core/layouts/portal-layout.component';
import { AuthService } from '@features/auth/services/application/auth.service';
import {
  NotificationApiService,
  AppNotification,
} from '@core/notifications/services/api/notification-api.service';
import { NotificationDestinationResolver } from '@core/notifications/services/navigation/notification-destination.resolver';
import { NotificationWebSocketService } from '@core/notifications/services/websocket/notification-websocket.service';

describe('PortalLayoutComponent', () => {
  it('creates the authenticated shell', () => {
    TestBed.configureTestingModule({
      imports: [PortalLayoutComponent],
      providers: [
        provideRouter([]),
        MessageService,
        { provide: AuthService, useValue: { logout: vi.fn(), accessToken: signal(null) } },
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
    expect(TestBed.createComponent(PortalLayoutComponent).componentInstance).toBeTruthy();
  });
});
