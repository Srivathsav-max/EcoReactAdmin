import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getCurrentUser } from "@/lib/session";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const body = await req.json();
    const { name, description, logoUrl, website } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Verify store ownership
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: user.id,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const brand = await prismadb.brand.create({
      data: {
        name,
        description,
        logoUrl,
        website,
        storeId: params.storeId,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
      }
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.log('[BRANDS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const brands = await prismadb.brand.findMany({
      where: {
        storeId: params.storeId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.log('[BRANDS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; brandId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    // Verify store ownership
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: user.id,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const brand = await prismadb.brand.delete({
      where: {
        id: params.brandId
      }
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.log('[BRAND_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; brandId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const body = await req.json();
    const { name, description, logoUrl, website } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Verify store ownership
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: user.id,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const brand = await prismadb.brand.update({
      where: {
        id: params.brandId
      },
      data: {
        name,
        description,
        logoUrl,
        website,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
      }
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.log('[BRAND_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 