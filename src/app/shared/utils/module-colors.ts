export interface ModuleColor {
  icon: string;
  background: string;
}

export const BRAND_BLUE = '#1e40af';
export const BRAND_BLUE_LIGHT = '#2563eb';
export const BRAND_RED = '#b91c2c';
export const BRAND_RED_LIGHT = '#dc2626';

export const PORTAL_MODULE_COLORS = {
  dashboard: { icon: BRAND_BLUE, background: 'rgba(30,64,175,0.1)' },
  products: { icon: BRAND_BLUE_LIGHT, background: 'rgba(37,99,235,0.1)' },
  quotes: { icon: BRAND_BLUE, background: 'rgba(30,64,175,0.1)' },
  orders: { icon: BRAND_BLUE_LIGHT, background: 'rgba(37,99,235,0.1)' },
  invoices: { icon: BRAND_RED, background: 'rgba(185,28,44,0.1)' },
  payments: { icon: BRAND_RED_LIGHT, background: 'rgba(220,38,38,0.1)' },
  profile: { icon: BRAND_BLUE, background: 'rgba(30,64,175,0.1)' },
} as const satisfies Record<string, ModuleColor>;

export type PortalModule = keyof typeof PORTAL_MODULE_COLORS;
