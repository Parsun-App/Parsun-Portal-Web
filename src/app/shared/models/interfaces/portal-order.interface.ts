export interface PortalOrderList {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: string;
  subtotal: number;
  lineCount: number;
  invoiceId: string | null;
  createdAt: string;
}

export interface PortalOrderDetail {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  status: string;
  notes: string | null;
  subtotal: number;
  invoiceId: string | null;
  invoiceNumber: string | null;
  createdAt: string;
  lines: PortalOrderLine[];
}

export interface PortalOrderLine {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}
