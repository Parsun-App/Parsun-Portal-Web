import { AppNotification } from '@core/notifications/services/api/notification-api.service';

export interface RawNotificationPayload {
  id: string | { value: string };
  type: string;
  title: string;
  message: string;
  referenceType: string | null;
  referenceId: string | null;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
  readAt: string | null;
}

export function normalizeNotification(payload: RawNotificationPayload): AppNotification {
  return {
    id: typeof payload.id === 'string' ? payload.id : payload.id.value,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    referenceType: payload.referenceType,
    referenceId: payload.referenceId,
    isRead: payload.isRead ?? payload.read ?? false,
    createdAt: payload.createdAt,
    readAt: payload.readAt,
  };
}
