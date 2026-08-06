export const QUOTES_MESSAGES = {
  loadError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudieron cargar los presupuestos' },
  detailError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo cargar el detalle del presupuesto' },
  productsLoadError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudieron cargar los productos' },
  createSuccess: { severity: 'success' as const, summary: 'Éxito', detail: 'Presupuesto creado correctamente' },
  createError: { severity: 'error' as const, summary: 'Error', detail: 'No se pudo crear el presupuesto' },
  validationError: { severity: 'warn' as const, summary: 'Revisa el formulario', detail: 'Agrega al menos una línea con producto, cantidad y precio válidos' },
  duplicateProductError: { severity: 'warn' as const, summary: 'Producto duplicado', detail: 'Ese producto ya está en otra línea del presupuesto' },
};
