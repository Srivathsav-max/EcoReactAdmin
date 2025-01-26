import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string, variantId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    if (!params.variantId) {
      return new NextResponse("Variant ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized - Store access denied", { status: 403 });
    }

    const variant = await prismadb.variant.findFirst({
      where: {
        id: params.variantId,
        product: {
          storeId: params.storeId
        }
      },
      include: {
        stockItems: true,
        color: true,
        size: true,
        images: true,
        optionValues: {
          include: {
            optionValue: {
              include: {
                optionType: true
              }
            }
          }
        }
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
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const body = await req.json();
    
    const { 
      name,
      price,
      colorId,
      sizeId,
      sku,
      stockCount,
      compareAtPrice,
      costPrice,
      allowBackorder,
      lowStockAlert,
      optionValues = []
    } = body;

    if (!params.variantId) {
      return new NextResponse("Variant ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized - Store access denied", { status: 403 });
    }

    await prismadb.variantOptionValue.deleteMany({
      where: {
        variantId: params.variantId,
      }
    });

    const variant = await prismadb.variant.update({
      where: {
        id: params.variantId
      },
      data: {
        name,
        price,
        colorId: colorId || null,
        sizeId: sizeId || null,
        sku: sku || null,
        compareAtPrice: compareAtPrice || null,
        costPrice: costPrice || null,
        allowBackorder: allowBackorder || false,
        lowStockAlert: lowStockAlert || null,
        optionValues: {
          createMany: {
            data: optionValues.map((ov: { optionValueId: string }) => ({
              optionValueId: ov.optionValueId,
            }))
          }
        }
      },
      include: {
        stockItems: true,
        color: true,
        size: true,
        optionValues: {
          include: {
            optionValue: {
              include: {
                optionType: true
              }
            }
          }
        }
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
  { params }: { params: { storeId: string, variantId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    if (!params.variantId) {
      return new NextResponse("Variant ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized - Store access denied", { status: 403 });
    }

    const variant = await prismadb.variant.delete({
      where: {
        id: params.variantId
      }
    });
  
    return NextResponse.json(variant);
  } catch (error) {
    console.log('[VARIANT_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}