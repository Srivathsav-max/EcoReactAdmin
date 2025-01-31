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

    // Remove stockCount from variant data as it's not a field in the Variant model
    const { stockCount, ...variantData } = body;

    const variant = await prismadb.variant.create({
      data: {
        ...variantData,
        productId: params.productId,
        stockItems: {
          create: {
            storeId: params.storeId,
            count: stockCount || 0,
            stockStatus: (stockCount || 0) > 0 ? 'in_stock' : 'out_of_stock'
          }
        }
      },
      include: {
        stockItems: true,
        color: true,
        size: true
      }
    });

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
