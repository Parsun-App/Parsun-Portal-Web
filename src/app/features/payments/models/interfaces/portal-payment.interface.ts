export interface PortalPaymentList {
  id: string;
  paymentNumber: string;
  customerId: string;
  amount: number;
  referenceNumber: string | null;
  paymentDate: string;
  status: string;
  appliedAmount: number;
  createdAt: string;
}

export interface PortalPaymentDetail {
  id: string;
  paymentNumber: string;
  amount: number;
  paymentMethodId: string;
  referenceNumber: string | null;
  paymentDate: string;
  notes: string | null;
  status: string;
  appliedAmount: number;
  createdAt: string;
}
