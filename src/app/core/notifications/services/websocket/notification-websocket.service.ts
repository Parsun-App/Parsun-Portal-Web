import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { AuthService } from '@features/auth/services/application/auth.service';
import { AppNotification } from '@core/notifications/services/api/notification-api.service';
import {
  normalizeNotification,
  RawNotificationPayload,
} from '@core/notifications/services/websocket/notification-payload.mapper';

@Injectable({ providedIn: 'root' })
export class NotificationWebSocketService implements OnDestroy {
  private readonly authService = inject(AuthService);
  private stompClient: Client | null = null;

  readonly connected = signal(false);
  readonly notification$ = new Subject<AppNotification>();

  connect(): void {
    const customer = this.authService.currentUser();
    if (!customer) return;

    const token = this.getAccessToken();
    if (!token) return;

    if (this.stompClient?.active) return;

    const origin = window.location.origin;
    const wsProtocol = origin.startsWith('https') ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${new URL(origin).host}/ws`;

    this.stompClient = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    this.stompClient.onConnect = () => {
      this.connected.set(true);
      this.stompClient!.subscribe(
        `/topic/notifications/customer/${customer.id}`,
        (message: IMessage) => {
          try {
            const payload: RawNotificationPayload = JSON.parse(message.body);
            this.notification$.next(normalizeNotification(payload));
          } catch {}
        },
      );
    };

    this.stompClient.onDisconnect = () => this.connected.set(false);
    this.stompClient.onStompError = () => this.connected.set(false);
    this.stompClient.activate();
  }

  disconnect(): void {
    this.stompClient?.deactivate();
    this.stompClient = null;
    this.connected.set(false);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private getAccessToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null;
  }
}
