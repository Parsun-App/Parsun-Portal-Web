export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  SENT: 'Enviado',
  CONVERTED: 'Convertido',
  CANCELLED: 'Cancelado',
  EXPIRED: 'Vencido',

  CONFIRMED: 'Confirmado',
  INVOICED: 'Facturado',

  PENDING_PAYMENT: 'Pendiente de Pago',
  PARTIALLY_PAID: 'Parcialmente Pagada',
  PAID: 'Pagada',
  OVERDUE: 'Vencida',

  APPLIED: 'Aplicado',
  PENDING: 'Pendiente',
  REJECTED: 'Rechazado',
} as const;

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}
