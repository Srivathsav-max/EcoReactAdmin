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
      stockItemId,
      quantity,
      type,
      reason
    } = body;

    if (!variantId) {
      return new NextResponse("Variant ID is required", { status: 400 });
    }

    if (!stockItemId) {
      return new NextResponse("Stock Item ID is required", { status: 400 });
    }

    if (!quantity) {
      return new NextResponse("Quantity is required", { status: 400 });
    }

    if (!type) {
      return new NextResponse("Movement type is required", { status: 400 });
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

    // Create stock movement
    const stockMovement = await prismadb.stockMovement.create({
      data: {
        variantId,
        stockItemId,
        quantity,
        type,
        reason
      },
      include: {
        variant: {
          include: {
            product: true
          }
        },
        stockItem: true
      }
    });

    // Update stock item quantity based on movement type
    const stockItem = await prismadb.stockItem.findUnique({
      where: { id: stockItemId }
    });

    if (stockItem) {
      let newCount = stockItem.count;
      if (type === 'increment') {
        newCount += quantity;
      } else if (type === 'decrement') {
        newCount = Math.max(0, newCount - quantity);
      } else if (type === 'adjustment') {
        newCount = quantity;
      }

      await prismadb.stockItem.update({
        where: { id: stockItemId },
        data: {
          count: newCount,
          stockStatus: newCount === 0 ? 'out_of_stock' : 
                      newCount <= (stockItem.lowStockAlert || 5) ? 'low_stock' : 
                      'in_stock'
        }
      });
    }

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
    const { searchParams } = new URL(req.url);
    const variantId = searchParams.get('variantId');
    const stockItemId = searchParams.get('stockItemId');
    const type = searchParams.get('type');

    const stockMovements = await prismadb.stockMovement.findMany({
      where: {
        variant: {
          product: {
            storeId: params.storeId
          }
        },
        ...(variantId && { variantId }),
        ...(stockItemId && { stockItemId }),
        ...(type && { type })
      },
      include: {
        variant: {
          include: {
            product: true,
            color: true,
            size: true
          }
        },
        stockItem: true
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