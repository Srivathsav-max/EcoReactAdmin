import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import prismadb from "@/lib/prismadb";

// GET /api/public/store?domain={domain}
export async function GET(
  req: Request
) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return new NextResponse("Domain is required", { status: 400 });
    }

    const store = await prismadb.store.findFirst({
      where: {
        domain: domain
      },
      select: {
        id: true,
        name: true,
        domain: true
      }
    });

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error('[PUBLIC_STORE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
