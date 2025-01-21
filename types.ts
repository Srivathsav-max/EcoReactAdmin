import { Store, Product, Variant, StockItem, StockMovement } from "@prisma/client";

export interface StoreWithSettings extends Store {
  currency: string | null;
  locale: string | null;
}

export interface StockMovementWithRelations extends StockMovement {
  variant: VariantWithRelations;
  stockItem: StockItem;
}

export interface VariantWithRelations extends Variant {
  product: Product;
  color?: { name: string } | null;
  size?: { name: string } | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
