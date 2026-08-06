export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  CUSTOMER_DRAFT: 'Borrador por Cliente',
  SENT: 'Enviado',
  CONVERTED: 'Convertido',
  CONVERTED_TO_ORDER: 'Convertido a Orden',
  CONVERTED_TO_INVOICE: 'Convertido a Factura',
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
