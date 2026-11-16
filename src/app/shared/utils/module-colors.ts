export interface ModuleColor {
  icon: string;
  background: string;
}

export const PORTAL_MODULE_COLORS = {
  dashboard: { icon: '#6366f1', background: 'rgba(99,102,241,0.1)' },
  products: { icon: '#0ea5e9', background: 'rgba(14,165,233,0.1)' },
  quotes: { icon: '#3b82f6', background: 'rgba(59,130,246,0.1)' },
  orders: { icon: '#22c55e', background: 'rgba(34,197,94,0.1)' },
  invoices: { icon: '#ef4444', background: 'rgba(239,68,68,0.1)' },
  payments: { icon: '#f59e0b', background: 'rgba(245,158,11,0.1)' },
  profile: { icon: '#8b5cf6', background: 'rgba(139,92,246,0.1)' },
} as const satisfies Record<string, ModuleColor>;

export type PortalModule = keyof typeof PORTAL_MODULE_COLORS;
