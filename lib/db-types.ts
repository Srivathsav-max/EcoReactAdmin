import { Prisma } from "@prisma/client";

export type FullStoreInclude = Prisma.StoreInclude & {
  billboards: true;
  products: {
    include: {
      images: true;
    };
  };
  taxonomies: {
    include: {
      taxons: true;
    };
  };
};

export const fullStoreInclude: FullStoreInclude = {
  billboards: true,
  products: {
    include: {
      images: true
    }
  },
  taxonomies: {
    include: {
      taxons: true
    }
  }
};

export type StoreWithDetails = Prisma.StoreGetPayload<{ include: FullStoreInclude }>;

export type StorePublicData = Prisma.StoreGetPayload<{
  select: {
    id: true;
    name: true;
    domain: true;
    logoUrl: true;
    faviconUrl: true;
    customCss: true;
  };
}>;

export const storePublicSelect = {
  id: true,
  name: true,
  domain: true,
  logoUrl: true,
  faviconUrl: true,
  customCss: true
} as const;