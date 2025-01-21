import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: { variantId: string, storeId: string } }
) {
  try {
    if (!params.variantId) {
      return new NextResponse("Variant id is required", { status: 400 });
    }

    const variant = await prismadb.variant.findUnique({
      where: {
        id: params.variantId,
      },
      include: {
        product: true,
        color: true,
        size: true,
        stockItems: true,
        images: true,
      }
    });

    return NextResponse.json(variant);
  } catch (error) {
    console.log('[VARIANT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, variantId: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const session = await verifyAuth(token);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    const { 
      name,
      productId, 
      colorId, 
      sizeId, 
      price,
      sku,
      stockCount,
      compareAtPrice,
      costPrice,
      allowBackorder,
      lowStockAlert
    } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Verify store ownership
    const storeByUser = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.user.id,
      }
    });

    if (!storeByUser) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Update variant with all fields
    const variant = await prismadb.variant.update({
      where: {
        id: params.variantId
      },
      data: {
        name,
        productId,
        colorId: colorId || null,
        sizeId: sizeId || null,
        price: price || 0,
        sku: sku || null,
        compareAtPrice: compareAtPrice || null,
        costPrice: costPrice || null,
        allowBackorder: allowBackorder || false,
        lowStockAlert: lowStockAlert || null,
        stockItems: stockCount ? {
          upsert: {
            where: {
              variantId_storeId: {
                variantId: params.variantId,
                storeId: params.storeId,
              }
            },
            create: {
              count: stockCount,
              storeId: params.storeId,
            },
            update: {
              count: stockCount,
            }
          }
        } : undefined
      },
      include: {
        stockItems: true,
        color: true,
        size: true,
      }
    });

    return NextResponse.json(variant);
  } catch (error) {
    console.log('[VARIANT_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { variantId: string, storeId: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const session = await verifyAuth(token);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify store ownership
    const storeByUser = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.user.id,
      }
    });

    if (!storeByUser) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const variant = await prismadb.variant.delete({
      where: {
        id: params.variantId,
      }
    });

    return NextResponse.json(variant);
  } catch (error) {
    console.log('[VARIANT_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 