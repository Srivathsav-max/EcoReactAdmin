import { Brand, Color, Size, Product, Store, Taxonomy, Image, Variant, OptionType } from "@prisma/client";

export interface NavigationTaxonomy extends Taxonomy {
  taxons: {
    id: string;
    name: string;
    prettyId: string;
    description: string | null;
    position: number;
    visible: boolean;
    metadata: any;
    parentId: string | null;
    taxonomyId: string;
  }[];
}

export interface ExtendedProduct extends Product {
  images: Image[];
  brand: Brand | null;
  variants: (Variant & {
    size: Size | null;
    color: Color | null;
  })[];
  taxons: Taxonomy[];
  optionTypes: (OptionType & {
    optionValues: {
      id: string;
      name: string;
      presentation: string;
      position: number;
    }[];
  })[];
}

export interface PageData {
  product: ExtendedProduct | null;
  brands: Brand[];
  colors: Color[];
  sizes: Size[];
  taxonomies: NavigationTaxonomy[];
  store: Store | null;
}