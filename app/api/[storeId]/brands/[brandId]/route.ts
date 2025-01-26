import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { brandId: string } }
) {
  try {
    if (!params.brandId) {
      return new NextResponse("Brand id is required", { status: 400 });
    }

    const brand = await prismadb.brand.findUnique({
      where: {
        id: params.brandId
      }
    });
  
    return NextResponse.json(brand);
  } catch (error) {
    console.log('[BRAND_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, brandId: string } }
) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    
    const { name, description, logoUrl, website, isActive } = body;

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.brandId) {
      return new NextResponse("Brand id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: user.id,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
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
        isActive
      }
    });
  
    return NextResponse.json(brand);
  } catch (error) {
    console.log('[BRAND_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, brandId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.brandId) {
      return new NextResponse("Brand id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: user.id,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
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