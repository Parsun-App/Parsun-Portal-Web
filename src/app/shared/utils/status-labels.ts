/** Mapa de etiquetas en español para todos los estados del portal */
export const STATUS_LABELS: Record<string, string> = {
  // Presupuestos
  DRAFT: 'Borrador',
  SENT: 'Enviado',
  CONVERTED: 'Convertido',
  CANCELLED: 'Cancelado',
  EXPIRED: 'Vencido',

  // Órdenes
  CONFIRMED: 'Confirmado',
  INVOICED: 'Facturado',

  // Facturas
  PENDING_PAYMENT: 'Pendiente de Pago',
  PARTIALLY_PAID: 'Parcialmente Pagada',
  PAID: 'Pagada',
  OVERDUE: 'Vencida',

  // Pagos
  APPLIED: 'Aplicado',
  PENDING: 'Pendiente',
  REJECTED: 'Rechazado',
} as const;

/** Obtiene la etiqueta en español para un estado */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}
