import { Product, Variant, Size, Color } from "@/types/models";
import { Property } from "./properties-manager";

export type ProductWithMetadata = Product & {
  brandId?: string;
  colorId?: string;
  sizeId?: string;
  sku?: string;
  barcode?: string;
  tags?: string[];
  taxRate?: number;
  weight?: number;
  height?: number;
  width?: number;
  depth?: number;
  minimumQuantity: number;
  maximumQuantity?: number;
  variants: Array<Variant & { size: Size | null; color: Color | null }>;
  optionTypes?: Array<{ name: string; presentation: string; position: number }>;
  properties?: Property[];
  shippingCategory?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
};

export interface StockItem {
  id: string;
  count: number;
  backorderable: boolean;
  variantId: string;
}

export interface StockManagerVariant {
  id: string;
  name: string;
  sku: string;
  stockItems: StockItem[];
}

export type ProductFormType = Omit<ProductWithMetadata, 'id' | 'createdAt' | 'updatedAt'>;