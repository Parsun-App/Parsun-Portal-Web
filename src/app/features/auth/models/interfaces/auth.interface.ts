export interface PortalLoginRequest {
  rif: string;
  password: string;
}

export interface CustomerSummary {
  id: string;
  legalName: string;
  rif: string;
  alias: string | null;
  priceTypeId: string | null;
  paymentType: string | null;
}

export interface PortalAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  customer: CustomerSummary;
}
