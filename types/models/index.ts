// Basic shared interfaces
export interface Image {
  id: string;
  url: string;
  position: number;
  alt?: string | null;
  fileId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Size {
  id: string;
  name: string;
  value: string;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Color {
  id: string;
  name: string;
  value: string;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockItem {
  id: string;
  count: number;
  stockStatus: string;
  reserved: number;
  backorderedQty: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrismaOptionType {
  id: string;
  name: string;
  presentation: string;
  position: number;
  storeId: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
  optionValues: PrismaOptionValue[];
}

export interface PrismaOptionValue {
  id: string;
  name: string;
  presentation: string;
  position: number;
  optionTypeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrismaVariantOptionValue {
  optionValue: PrismaOptionValue & {
    optionType: {
      id: string;
      name: string;
      presentation: string;
    };
  };
}

// Prisma types (raw data from database)
export interface PrismaTaxon {
  id: string;
  name: string;
  permalink: string | null;
  description: string | null;
  position: number;
  taxonomyId: string;
  billboardId: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  billboard?: {
    id: string;
    label: string;
    imageUrl: string;
  } | null;
  taxonomy: {
    id: string;
    name: string;
    description: string | null;
    storeId: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface PrismaProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: any; // Decimal from Prisma
  status: string;
  isVisible: boolean;
  hasVariants: boolean;
  images: Image[];
  brand: Brand | null;
  variants: PrismaVariant[];
  taxons: PrismaTaxon[];
  optionTypes: PrismaOptionType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PrismaVariant {
  id: string;
  name: string;
  sku: string;
  price: any; // Decimal from Prisma
  compareAtPrice: any | null; // Decimal from Prisma
  position: number;
  isVisible: boolean;
  isDefault: boolean;
  images: Image[];
  size: Size | null;
  color: Color | null;
  stockItems: StockItem[];
  optionValues: PrismaVariantOptionValue[];
  createdAt: Date;
  updatedAt: Date;
}

// Component interfaces (what we use in the UI)
export interface OptionType {
  id: string;
  name: string;
  presentation: string;
  position: number;
  optionValues: OptionValue[];
}

export interface OptionValue {
  id: string;
  name: string;
  presentation: string;
  position: number;
  optionType: {
    id: string;
    name: string;
    presentation: string;
  };
}

export interface VariantOptionValue {
  optionValue: OptionValue;
}

export interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  position: number;
  isVisible: boolean;
  isDefault: boolean;
  images: Image[];
  size: Size | null;
  color: Color | null;
  stockItems: StockItem[];
  optionValues: VariantOptionValue[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Billboard {
  id: string;
  label: string;
  imageUrl: string;
}

export interface Taxon {
  id: string;
  name: string;
  permalink: string;
  description?: string | null;
  position: number;
  billboard?: Billboard | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  status: string;
  isVisible: boolean;
  hasVariants: boolean;
  images: Image[];
  brand: Brand | null;
  variants: Variant[];
  taxons: Taxon[];
  optionTypes: OptionType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterParams {
  sizeId?: string;
  colorId?: string;
  brandId?: string;
  sort?: string;
}

// Navigation types
export interface SimpleTaxon {
  id: string;
  name: string;
  permalink: string;
}

export interface NavigationTaxonomy {
  id: string;
  name: string;
  taxons: SimpleTaxon[];
}

// Layout Component Types
export interface BaseComponentConfig {
  title?: string;
}

export interface BillboardConfig extends BaseComponentConfig {
  label: string;
  imageUrl: string;
  callToAction: {
    text: string;
    link: string;
  };
}

export interface ProductsConfig extends BaseComponentConfig {
  title: string;
  productIds: string[];
  products?: Product[];
  itemsPerRow: number;
  maxItems: number;
}

export interface BannerConfig extends BaseComponentConfig {
  title: string;
  subtitle: string;
  imageUrl: string;
  callToAction: {
    text: string;
    link: string;
  };
}

export interface CategoriesConfig extends BaseComponentConfig {
  title: string;
  categoryIds: string[];
  categories?: Taxon[];
  displayStyle: 'grid' | 'carousel';
}

export type ComponentConfig = 
  | BillboardConfig 
  | ProductsConfig 
  | BannerConfig 
  | CategoriesConfig;

export interface LayoutComponent {
  id: string;
  type: 'billboard' | 'featured-products' | 'banner' | 'categories' | 'products-grid' | 'products-carousel';
  config: ComponentConfig;
  position: number;
  isVisible: boolean;
}