import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    if (!params.storeId) {
      return NextResponse.json({
        success: false,
        message: "Store id is required"
      }, { status: 400 });
    }

    if (!params.productId) {
      return NextResponse.json({
        success: false,
        message: "Product id is required"
      }, { status: 400 });
    }

    const variants = await prismadb.variant.findMany({
      where: {
        productId: params.productId
      },
      include: {
        color: true,
        size: true,
        stockItems: true,
        images: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: variants
    });
  } catch (error) {
    console.error('[VARIANTS_GET]', error);
    return NextResponse.json({
      success: false,
      message: "Internal error"
    }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { status: 401 });
    }

    const body = await req.json();

    const variant = await prismadb.variant.create({
      data: {
        ...body,
        productId: params.productId,
      }
    });

    // Create stock item for the variant
    if (body.stockCount !== undefined) {
      await prismadb.stockItem.create({
        data: {
          variantId: variant.id,
          storeId: params.storeId,
          count: body.stockCount,
          stockStatus: body.stockCount > 0 ? 'in_stock' : 'out_of_stock'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: variant
    });
  } catch (error) {
    console.error('[VARIANTS_POST]', error);
    return NextResponse.json({
      success: false,
      message: "Internal error"
    }, { status: 500 });
  }
}