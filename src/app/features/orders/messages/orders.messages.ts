export const ORDERS_MESSAGES = {
  loadError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudieron cargar las órdenes' },
  detailError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo cargar el detalle de la orden' },
  confirmSuccess: { severity: 'success' as const, summary: 'Confirmada', detail: 'Orden confirmada exitosamente' },
  confirmError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo confirmar la orden' },
  cancelSuccess: { severity: 'info' as const, summary: 'Cancelada', detail: 'Orden cancelada' },
  cancelError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo cancelar la orden' },
  createSuccess: { severity: 'success' as const, summary: 'Éxito', detail: 'Orden creada correctamente' },
  createError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo crear la orden' },
  updateSuccess: { severity: 'success' as const, summary: 'Éxito', detail: 'Orden actualizada correctamente' },
  updateError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo actualizar la orden' },
  duplicateProductError: { severity: 'warn' as const, summary: 'Aviso', detail: 'Este producto ya fue agregado' },
  validationError: { severity: 'warn' as const, summary: 'Aviso', detail: 'Completa al menos una línea con producto' },
};
