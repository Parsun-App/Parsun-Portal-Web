import { describe, expect, it } from 'vitest';
import {
  normalizeNotification,
  RawNotificationPayload,
} from '@core/notifications/services/websocket/notification-payload.mapper';

const base: RawNotificationPayload = {
  id: 'notification-1',
  type: 'ORDER_APPROVED',
  title: 'Pedido aprobado',
  message: 'Tu pedido ha sido aprobado.',
  referenceType: 'ORDER',
  referenceId: 'order-1',
  isRead: false,
  createdAt: '2026-11-16T22:20:50',
  readAt: null,
};

describe('normalizeNotification', () => {
  it('maps a flat payload to the notification contract', () => {
    expect(normalizeNotification(base)).toEqual({
      id: 'notification-1',
      type: 'ORDER_APPROVED',
      title: 'Pedido aprobado',
      message: 'Tu pedido ha sido aprobado.',
      referenceType: 'ORDER',
      referenceId: 'order-1',
      isRead: false,
      createdAt: '2026-11-16T22:20:50',
      readAt: null,
    });
  });

  it('unwraps an id serialized as a value object', () => {
    const normalized = normalizeNotification({ ...base, id: { value: 'notification-2' } });

    expect(normalized.id).toBe('notification-2');
  });

  it('accepts the legacy read flag and defaults missing flags to unread', () => {
    const withoutFlags: RawNotificationPayload = { ...base };
    delete withoutFlags.isRead;

    expect(normalizeNotification(withoutFlags).isRead).toBe(false);
    const legacyRead: RawNotificationPayload = { ...withoutFlags, read: true };
    expect(normalizeNotification(legacyRead).isRead).toBe(true);
  });
});
