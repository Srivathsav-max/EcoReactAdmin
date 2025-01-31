import { Prisma } from "@prisma/client";
import prismadb from "@/lib/prismadb";
import { StoreWithDetails, StorePublicData } from "@/types/store";

type RawStore = {
  id: string;
  name: string;
  domain: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  customCss: string | null;
  currency: string | null;
};

export async function getStoreByDomain(domainName: string): Promise<StoreWithDetails | null> {
  try {
    // Find store by domain using raw query
    // Clean up domain name
    let cleanDomain = domainName;
    
    // Handle local development domains
    if (cleanDomain.includes('.lvh.me')) {
      cleanDomain = cleanDomain.split('.lvh.me')[0];
    }
    
    // Handle development domains with port
    if (cleanDomain.includes(':')) {
      cleanDomain = cleanDomain.split(':')[0];
    }
    
    // Remove www and any other subdomains
    cleanDomain = cleanDomain.split('.').slice(-2).join('.');
    
    console.log('[GET_STORE_DEBUG] Original domain:', domainName);
    console.log('[GET_STORE_DEBUG] Cleaned domain:', cleanDomain);

    const rawQuery = Prisma.sql`
      SELECT id FROM "Store"
      WHERE domain = ${cleanDomain}
      LIMIT 1
    `;

    const stores = await prismadb.$queryRaw<RawStore[]>(rawQuery);

    if (!stores || stores.length === 0) {
      return null;
    }

    // Get full store details using Prisma client
    const store = await prismadb.store.findUnique({
      where: {
        id: stores[0].id
      },
      include: {
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
      }
    });

    if (!store) {
      return null;
    }

    return store as unknown as StoreWithDetails;
  } catch (error) {
    console.error('[GET_STORE_BY_DOMAIN]', error);
    return null;
  }
}

export async function getStorePublicData(domainName: string): Promise<StorePublicData | null> {
  try {
    // Clean up domain name
    let cleanDomain = domainName;
    
    // Handle local development domains
    if (cleanDomain.includes('.lvh.me')) {
      cleanDomain = cleanDomain.split('.lvh.me')[0];
    }
    
    // Handle development domains with port
    if (cleanDomain.includes(':')) {
      cleanDomain = cleanDomain.split(':')[0];
    }
    
    // Remove www and any other subdomains
    cleanDomain = cleanDomain.split('.').slice(-2).join('.');
    
    console.log('[GET_STORE_DEBUG] Original domain:', domainName);
    console.log('[GET_STORE_DEBUG] Cleaned domain:', cleanDomain);

    const rawQuery = Prisma.sql`
      SELECT
        id, name, domain, "logoUrl", "faviconUrl", "customCss", currency
      FROM "Store"
      WHERE domain = ${cleanDomain}
      LIMIT 1
    `;

    const stores = await prismadb.$queryRaw<RawStore[]>(rawQuery);

    if (!stores || stores.length === 0) {
      return null;
    }

    return stores[0] as StorePublicData;
  } catch (error) {
    console.error('[GET_STORE_PUBLIC_DATA]', error);
    return null;
  }
}
