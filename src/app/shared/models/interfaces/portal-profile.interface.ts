export interface PortalProfile {
  id: string;
  legalName: string;
  rif: string;
  alias: string | null;
  type: string;
  paymentType: string;
  creditDays: number;
  creditLimit: number;
  currentBalance: number;
  emails: string[];
  phones: string[];
  addresses: ProfileAddress[];
}

export interface ProfileAddress {
  address: string;
  billing: boolean;
  state: string;
  municipality: string;
}
