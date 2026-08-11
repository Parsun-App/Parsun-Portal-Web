export interface PortalInvoiceList {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  status: string;
  statusLabel: string;
  paymentType: string;
  subtotal: number;
  total: number;
  paidAmount: number;
  pendingApprovalAmount: number;
  lineCount: number;
  createdAt: string;
}

export interface PortalInvoiceDetail {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  status: string;
  paymentType: string;
  notes: string | null;
  subtotal: number;
  createdAt: string;
  lines: PortalInvoiceLine[];
}

export interface PortalInvoiceLine {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}
