export interface PortalDashboard {
  draftQuotes: number;
  confirmedOrders: number;
  pendingInvoices: number;
  pendingAmount: number;
  recentActivity: PortalRecentActivity[];
  pendingOrders: number;
}

export interface PortalRecentActivity {
  type: string;
  number: string;
  date: string;
  status: string;
  amount: number;
  reference?: string;
}
