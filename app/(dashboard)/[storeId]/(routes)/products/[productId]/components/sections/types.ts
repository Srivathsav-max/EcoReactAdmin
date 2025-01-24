import { NavigationTaxonomy, Product } from "@/types/models";
import { UseFormReturn } from "react-hook-form";

export interface ProductFormType {
  name: string;
  description: string;
  images: { url: string; fileId: string }[];
  price: number;
  brandId?: string;
  colorId?: string;
  sizeId?: string;
  taxons: string[];
  sku?: string;
  barcode?: string;
  isVisible: boolean;
  tags: string[];
  status: string;
  hasVariants: boolean;
  taxRate?: number;
  weight?: number;
  height?: number;
  width?: number;
  depth?: number;
  minimumQuantity: number;
  maximumQuantity?: number;
  optionTypes: Array<{ name: string; presentation: string; position: number }>;
}

export interface ProductFormProps {
  initialData: Product | null;
  brands: Array<{ id: string; name: string }>;
  colors: Array<{ id: string; name: string }>;
  sizes: Array<{ id: string; name: string }>;
  taxonomies: NavigationTaxonomy[];
  storeCurrency: string;
  storeLocale: string;
}

export interface ProductSpecificationsProps {
  loading: boolean;
  form: UseFormReturn<ProductFormType>;
  taxonomies: NavigationTaxonomy[];
}