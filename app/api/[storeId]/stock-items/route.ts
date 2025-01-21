import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
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
      variantId,
      count,
      stockStatus = "in_stock",
      reserved = 0,
      backorderedQty = 0
    } = body;

    if (!variantId) {
      return new NextResponse("Variant ID is required", { status: 400 });
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

    const stockItem = await prismadb.stockItem.create({
      data: {
        variantId,
        storeId: params.storeId,
        count,
        stockStatus,
        reserved,
        backorderedQty
      },
      include: {
        variant: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(stockItem);
  } catch (error) {
    console.log('[STOCK_ITEMS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const variantId = searchParams.get('variantId');
    const stockStatus = searchParams.get('stockStatus');

    const stockItems = await prismadb.stockItem.findMany({
      where: {
        storeId: params.storeId,
        ...(variantId && { variantId }),
        ...(stockStatus && { stockStatus })
      },
      include: {
        variant: {
          include: {
            product: true,
            color: true,
            size: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(stockItems);
  } catch (error) {
    console.log('[STOCK_ITEMS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 