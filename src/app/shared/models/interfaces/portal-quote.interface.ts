export interface PortalQuoteList {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  status: string;
  expiryDate: string;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface PortalQuoteDetail {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  createdBy: string;
  createdByName: string;
  status: string;
  expiryDate: string;
  notes: string | null;
  subtotal: number;
  orderId: string | null;
  orderNumber: string | null;
  invoiceId: string | null;
  invoiceNumber: string | null;
  cancelledAt: string | null;
  cancelledReason: string | null;
  createdAt: string;
  updatedAt: string;
  lines: PortalQuoteLine[];
}

export interface PortalQuoteLine {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}
