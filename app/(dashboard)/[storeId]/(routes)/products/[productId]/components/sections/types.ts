import { UseFormReturn } from "react-hook-form";

// Base types
export interface Color {
  id: string;
  name: string;
  value: string;
}

export interface Size {
  id: string;
  name: string;
  value: string;
}

// Product form related types
export interface ProductFormType {
  name: string;
  description: string;
  images: { url: string; fileId: string; }[];
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
  optionTypes: {
    name: string;
    presentation: string;
    position: number;
  }[];
}

export interface ProductFormProps {
  initialData: any;
  brands: any[];
  colors: Color[];
  sizes: Size[];
  taxonomies: any[];
  storeCurrency: string;
  storeLocale: string;
}

export interface BasicInformationProps {
  loading: boolean;
  form: UseFormReturn<ProductFormType>;
  brands: any[];
  colors: any[];
  sizes: any[];
  storeCurrency: string;
}

export interface ProductVariantsProps {
  loading: boolean;
  form: UseFormReturn<ProductFormType>;
  colors: Color[];
  sizes: Size[];
}

// Variant related types
export interface VariantType {
  id: string;
  name: string;
  sku: string;
  price: number;
  costPrice?: number;
  compareAtPrice?: number;
  stockCount?: number;
  isVisible: boolean;
  trackInventory: boolean;
  minimumQuantity: number;
  maximumQuantity?: number;
  weight?: number;
  height?: number;
  width?: number;
  depth?: number;
  allowBackorder: boolean;
  color?: Color;
  size?: Size;
  colorId?: string;
  sizeId?: string;
}