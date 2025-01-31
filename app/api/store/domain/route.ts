import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request
) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return new NextResponse("Domain is required", { status: 400 });
    }

    // Clean up domain name
    let cleanDomain = domain;
    
    console.log('[STORE_API_DEBUG] Original domain:', domain);
    
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
    
    console.log('[STORE_API_DEBUG] Cleaned domain:', cleanDomain);

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
      return new NextResponse("Store not found", { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error('[STORE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
