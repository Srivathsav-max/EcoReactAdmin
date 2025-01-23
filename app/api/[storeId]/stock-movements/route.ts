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
    
    const { 
      type,
      quantity,
      stockItemId,
      reason
    } = body;

    if (!type) {
      return new NextResponse("Movement type is required", { status: 400 });
    }

    if (typeof quantity !== 'number') {
      return new NextResponse("Quantity is required and must be a number", { status: 400 });
    }

    if (!stockItemId) {
      return new NextResponse("Stock item ID is required", { status: 400 });
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

    const stockItem = await prismadb.stockItem.findUnique({
      where: {
        id: stockItemId,
      },
      include: {
        variant: true
      }
    });

    if (!stockItem) {
      return new NextResponse("Stock item not found", { status: 404 });
    }

    const stockMovement = await prismadb.stockMovement.create({
      data: {
        type,
        quantity,
        stockItemId,
        variantId: stockItem.variantId,
        reason: reason || null,
      }
    });
  
    return NextResponse.json(stockMovement);
  } catch (error) {
    console.log('[STOCK_MOVEMENTS_POST]', error);
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
    const stockItemId = searchParams.get('stockItemId');
    const type = searchParams.get('type');

    const stockMovements = await prismadb.stockMovement.findMany({
      where: {
        stockItem: {
          storeId: params.storeId
        },
        ...(stockItemId && { stockItemId }),
        ...(type && { type }),
      },
      include: {
        stockItem: {
          include: {
            variant: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  
    return NextResponse.json(stockMovements);
  } catch (error) {
    console.log('[STOCK_MOVEMENTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}