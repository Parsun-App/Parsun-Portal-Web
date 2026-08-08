export const ORDERS_MESSAGES = {
  loadError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudieron cargar los pedidos' },
  detailError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo cargar el detalle del pedido' },
  confirmSuccess: { severity: 'success' as const, summary: 'Confirmado', detail: 'Pedido confirmado exitosamente' },
  confirmError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo confirmar el pedido' },
  cancelSuccess: { severity: 'info' as const, summary: 'Cancelado', detail: 'Pedido cancelado' },
  cancelError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo cancelar el pedido' },
  createSuccess: { severity: 'success' as const, summary: 'Éxito', detail: 'Pedido creado correctamente' },
  createError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo crear el pedido' },
  updateSuccess: { severity: 'success' as const, summary: 'Éxito', detail: 'Pedido actualizado correctamente' },
  updateError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo actualizar el pedido' },
  duplicateProductError: { severity: 'warn' as const, summary: 'Aviso', detail: 'Este producto ya fue agregado' },
  validationError: { severity: 'warn' as const, summary: 'Aviso', detail: 'Completa al menos una línea con producto' },
};
