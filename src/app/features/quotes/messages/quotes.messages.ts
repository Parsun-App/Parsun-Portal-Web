export const QUOTES_MESSAGES = {
  loadError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudieron cargar los presupuestos' },
  detailError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo cargar el detalle del presupuesto' },
  createSuccess: { severity: 'success' as const, summary: 'Éxito', detail: 'Presupuesto creado correctamente' },
  createError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo crear el presupuesto' },
  duplicateProductError: { severity: 'warn' as const, summary: 'Aviso', detail: 'Este producto ya fue agregado' },
  validationError: { severity: 'warn' as const, summary: 'Aviso', detail: 'Completa al menos una línea con producto' },
  cancelSuccess: { severity: 'success' as const, summary: 'Éxito', detail: 'Presupuesto cancelado correctamente' },
  cancelError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo cancelar el presupuesto' },
  updateSuccess: { severity: 'success' as const, summary: 'Éxito', detail: 'Presupuesto actualizado correctamente' },
  updateError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo actualizar el presupuesto' },
};
