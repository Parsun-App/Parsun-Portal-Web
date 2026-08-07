export const QUOTES_MESSAGES = {
  loadError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudieron cargar los presupuestos' },
  detailError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo cargar el detalle del presupuesto' },
  createSuccess: { severity: 'success' as const, summary: 'Éxito', detail: 'Presupuesto creado correctamente' },
  createError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo crear el presupuesto' },
};
