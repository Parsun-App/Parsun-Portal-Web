export const ORDERS_MESSAGES = {
  loadError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudieron cargar las órdenes' },
  detailError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo cargar el detalle de la orden' },
  confirmSuccess: { severity: 'success' as const, summary: 'Confirmada', detail: 'Orden confirmada exitosamente' },
  confirmError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo confirmar la orden' },
  cancelSuccess: { severity: 'info' as const, summary: 'Cancelada', detail: 'Orden cancelada' },
  cancelError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo cancelar la orden' },
};
