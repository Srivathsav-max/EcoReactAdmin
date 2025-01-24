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
  children?: PrismaTaxon[];
}

export interface PrismaProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: any;
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
  price: any;
  compareAtPrice: any | null;
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

// Component interfaces (UI types)
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
  brandId?: string;
  variants: (Variant & { 
    size: Size | null;
    color: Color | null;
  })[];
  taxons: Taxon[];
  optionTypes: OptionType[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  minimumQuantity: number;
  maximumQuantity?: number;
  sku?: string;
  colorId?: string;
  sizeId?: string;
  costPrice?: number;
  compareAtPrice?: number;
  isPromotionable?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface FilterParams {
  sizeId?: string;
  colorId?: string;
  brandId?: string;
  sort?: string;
}

// Navigation types with required permalink
export interface NavigationTaxon {
  id: string;
  name: string;
  permalink: string;
  description?: string | null;
  position: number;
  billboard?: Billboard | null;
  children?: NavigationTaxon[];
}

export interface NavigationTaxonomy {
  id: string;
  name: string;
  description?: string | null;
  taxons: NavigationTaxon[];
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

export interface SlidingBannersConfig extends BaseComponentConfig {
  interval: number;
  banners: Array<{
    id: string;
    label: string;
    imageUrl: string;
    link?: string;
  }>;
}

export type ComponentConfig =
  | BillboardConfig
  | ProductsConfig
  | BannerConfig
  | CategoriesConfig
  | SlidingBannersConfig;

export interface LayoutComponent {
  id: string;
  type: 'billboard' | 'featured-products' | 'banner' | 'categories' | 'products-grid' | 'products-carousel' | 'sliding-banners';
  config: ComponentConfig;
  position: number;
  isVisible: boolean;
}

// Type conversion utilities
export function isPrismaTaxon(taxon: unknown): taxon is PrismaTaxon {
  return (taxon as PrismaTaxon)?.taxonomy !== undefined;
}

export function convertToNavigationTaxon(taxon: PrismaTaxon): NavigationTaxon {
  return {
    id: taxon.id,
    name: taxon.name,
    permalink: taxon.permalink || '',
    description: taxon.description || null,
    position: taxon.position,
    billboard: taxon.billboard || null,
    children: taxon.children?.map(convertToNavigationTaxon)
  };
}

export function convertToNavigationTaxonomy(
  taxonomy: PrismaTaxon['taxonomy'] & { taxons: PrismaTaxon[] }
): NavigationTaxonomy {
  return {
    id: taxonomy.id,
    name: taxonomy.name,
    description: taxonomy.description || null,
    taxons: taxonomy.taxons.map(convertToNavigationTaxon)
  };
}