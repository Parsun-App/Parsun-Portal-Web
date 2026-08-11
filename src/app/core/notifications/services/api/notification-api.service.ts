import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  referenceType: string | null;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface UnreadCount {
  count: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly http = inject(HttpClient);

  list(unreadOnly?: boolean): Observable<AppNotification[]> {
    const params = unreadOnly ? '?unread=true' : '';
    return this.http.get<AppNotification[]>(`/api/portal/notifications${params}`);
  }

  getUnreadCount(): Observable<UnreadCount> {
    return this.http.get<UnreadCount>('/api/portal/notifications/unread-count');
  }

  markAsRead(id: string): Observable<void> {
    return this.http.put<void>(`/api/portal/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>('/api/portal/notifications/read-all', {});
  }
}
