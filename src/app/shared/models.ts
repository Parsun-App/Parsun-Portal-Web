export interface PortalDashboard {
  draftQuotes: number;
  confirmedOrders: number;
  pendingInvoices: number;
  pendingAmount: number;
  totalProducts: number;
  recentActivity: PortalRecentActivity[];
}

export interface PortalRecentActivity {
  type: 'QUOTE' | 'ORDER' | 'INVOICE' | 'PAYMENT';
  number: string;
  date: string;
  status: string;
  amount: number;
  reference: string;
}

export interface PortalProduct {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  availableStock: number;
  unit: string;
  categoryId: string;
  categoryName: string;
  active: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface PortalQuoteList {
  id: string;
  number: string;
  date: string;
  status: string;
  total: number;
  items: number;
  createdAt: string;
}

export interface PortalQuoteDetail {
  id: string;
  number: string;
  quoteNumber: string;
  date: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  notes?: string;
  expiryDate?: string;
  orderNumber?: string;
  createdByName?: string;
  createdAt: string;
  items: PortalQuoteItem[];
  lines: PortalQuoteItem[];
}

export interface PortalQuoteItem {
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PortalOrderList {
  id: string;
  number: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  items: number;
  createdAt: string;
}

export interface PortalOrderDetail {
  id: string;
  number: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  notes?: string;
  invoiceNumber?: string;
  createdAt: string;
  items: PortalOrderItem[];
  lines: PortalOrderItem[];
}

export interface PortalOrderItem {
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PortalInvoiceList {
  id: string;
  number: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: string;
  total: number;
  balance: number;
  paidAmount: number;
  createdAt: string;
}

export interface PortalInvoiceDetail {
  id: string;
  number: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  balance: number;
  paidAmount: number;
  paymentType?: string;
  notes?: string;
  createdAt: string;
  items: PortalInvoiceItem[];
  lines: PortalInvoiceItem[];
}

export interface PortalInvoiceItem {
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PortalPaymentList {
  id: string;
  number: string;
  date: string;
  method: string;
  status: string;
  amount: number;
  reference: string;
  createdAt: string;
}

export interface PortalPaymentDetail {
  id: string;
  number: string;
  paymentNumber: string;
  date: string;
  paymentDate: string;
  method: string;
  status: string;
  amount: number;
  appliedAmount: number;
  reference: string;
  referenceNumber: string;
  notes?: string;
  createdAt: string;
  invoices: PortalPaymentInvoice[];
}

export interface PortalPaymentInvoice {
  invoiceNumber: string;
  amount: number;
}

export interface PortalProfile {
  legalName: string;
  rif: string;
  type: string;
  alias: string;
  creditDays: number;
  creditLimit: number;
  paymentType: string;
  currentBalance: number;
  emails: string[];
  phones: string[];
  addresses: PortalAddress[];
}

export interface PortalAddress {
  id: string;
  address: string;
  state: string;
  municipality: string;
  postalCode: string;
  isBilling: boolean;
  billing: boolean;
}
