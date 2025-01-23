import { UseFormReturn } from "react-hook-form";
import {
  Brand,
  Color,
  Size,
  Image,
  Product,
  Variant,
  NavigationTaxonomy,
  Taxon
} from "@/types/models";

// Form-specific types
export interface ProductImage {
  url: string;
  fileId: string;
}

export interface ProductFormType {
  name: string;
  description?: string;
  images: ProductImage[];
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

// Component Props
export interface BasicInformationProps {
  loading: boolean;
  form: UseFormReturn<ProductFormType>;
  brands: Brand[];
  storeCurrency: string;
}

export interface ProductMediaProps {
  loading: boolean;
  form: UseFormReturn<ProductFormType>;
}

export interface ProductVariantsProps {
  loading: boolean;
  form: UseFormReturn<ProductFormType>;
  colors: Color[];
  sizes: Size[];
}

export interface ProductSpecificationsProps {
  loading: boolean;
  form: UseFormReturn<ProductFormType>;
  taxonomies: NavigationTaxonomy[];
}

export interface ProductVisibilityProps {
  loading: boolean;
  form: UseFormReturn<ProductFormType>;
}

export interface ProductFormProps {
  initialData: Product & {
    variants: (Variant & {
      size: Size | null;
      color: Color | null;
    })[];
    brandId?: string;
    colorId?: string;
    sizeId?: string;
    sku?: string;
    barcode?: string;
    tags: string[];
    taxRate?: number;
    weight?: number;
    height?: number;
    width?: number;
    depth?: number;
    minimumQuantity: number;
    maximumQuantity?: number;
  } | null;
  brands: Brand[];
  colors: Color[];
  sizes: Size[];
  taxonomies: NavigationTaxonomy[];
  initialTaxons?: Taxon[];
  storeCurrency: string;
  storeLocale: string;
}