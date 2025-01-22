import { Store, Billboard, Product, Taxon, Image } from "@prisma/client"

// Basic store interface with all fields
export interface StoreModel extends Store {
  domain: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  customCss: string | null;
  themeSettings: any | null;
}

// Store with all related data
export interface StoreWithDetails extends StoreModel {
  billboards: Billboard[];
  products: (Product & {
    images: Image[];
  })[];
  taxonomies: Array<{
    id: string;
    name: string;
    taxons: Taxon[];
  }>;
}

// Public store data
export interface StorePublicData {
  id: string;
  name: string;
  domain: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  customCss: string | null;
  currency: string | null;
}

// Query includes for store data
export const storeIncludes = {
  billboards: {
    take: 1,
    orderBy: {
      createdAt: 'desc'
    }
  },
  products: {
    where: {
      isVisible: true,
      status: 'active'
    },
    take: 8,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      images: {
        take: 1
      }
    }
  },
  taxonomies: {
    take: 1,
    include: {
      taxons: {
        where: {
          parentId: null
        },
        take: 6
      }
    }
  }
} as const;

// Public data select
export const publicFields = {
  id: true,
  name: true,
  domain: true,
  logoUrl: true,
  faviconUrl: true,
  customCss: true,
  currency: true
} as const;

// Type guard
export function isStoreWithDetails(obj: any): obj is StoreWithDetails {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    Array.isArray(obj.billboards) &&
    Array.isArray(obj.products) &&
    Array.isArray(obj.taxonomies) &&
    obj.taxonomies.every((t: any) => Array.isArray(t.taxons))
  );
}