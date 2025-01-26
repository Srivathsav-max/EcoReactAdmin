import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getAdminSession } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const body = await req.json();
    
    const { variantId, count = 0 } = body;

    if (!variantId) {
      return new NextResponse("Variant ID is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
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

    // Check if stock item already exists for this variant and store
    const existingStockItem = await prismadb.stockItem.findFirst({
      where: {
        variantId,
        storeId: params.storeId,
      }
    });

    if (existingStockItem) {
      return new NextResponse("Stock item already exists for this variant", { status: 400 });
    }

    const stockItem = await prismadb.stockItem.create({
      data: {
        variantId,
        storeId: params.storeId,
        count,
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
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const variantId = searchParams.get('variantId');

    const stockItems = await prismadb.stockItem.findMany({
      where: {
        storeId: params.storeId,
        ...(variantId && { variantId }),
      },
      include: {
        variant: {
          include: {
            product: true
          }
        }
      }
    });
  
    return NextResponse.json(stockItems);
  } catch (error) {
    console.log('[STOCK_ITEMS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}