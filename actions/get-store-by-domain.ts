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

    const store = await prismadb.store.findFirst({
      where: {
        domain: cleanDomain
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

    const store = await prismadb.store.findFirst({
      where: {
        domain: cleanDomain
      },
      select: {
        id: true,
        name: true,
        domain: true,
        logoUrl: true,
        faviconUrl: true,
        customCss: true,
        currency: true
      }
    });

    if (!store) {
      return null;
    }

    return store as StorePublicData;
  } catch (error) {
    console.error('[GET_STORE_PUBLIC_DATA]', error);
    return null;
  }
}
