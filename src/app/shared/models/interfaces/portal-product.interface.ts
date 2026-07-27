export interface PortalProduct {
  id: string;
  code: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  active: boolean;
  photo: string | null;
  price: number;
  availableStock: number;
}
