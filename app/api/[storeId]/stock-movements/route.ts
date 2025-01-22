import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { verifyAuth, isAdmin } from "@/lib/auth";
import { cookies } from "next/headers";
import { StockMovementType } from "@/app/(dashboard)/[storeId]/(routes)/stock-movements/components/columns";

const ITEMS_PER_PAGE = 100;

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const session = await verifyAuth();
    
    if (!session || !isAdmin(session)) {
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

    if (!type || !["increment", "decrement", "adjustment"].includes(type)) {
      return new NextResponse("Valid movement type is required", { status: 400 });
    }

    // Verify store ownership
    const storeByUser = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      },
      select: { id: true }
    });

    if (!storeByUser) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Create stock movement with minimal includes
    const stockMovement = await prismadb.stockMovement.create({
      data: {
        variantId,
        stockItemId,
        quantity,
        type: type as StockMovementType,
        reason
      },
      select: {
        id: true,
        quantity: true,
        type: true,
        reason: true,
        createdAt: true,
        variant: {
          select: {
            name: true,
            product: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Update stock item quantity based on movement type
    const stockItem = await prismadb.stockItem.findUnique({
      where: { id: stockItemId },
      select: {
        id: true,
        count: true
      }
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
                      newCount <= 5 ? 'low_stock' : 
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
    const type = searchParams.get('type') as StockMovementType | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || String(ITEMS_PER_PAGE));

    const stockMovements = await prismadb.stockMovement.findMany({
      take: limit,
      skip: (page - 1) * limit,
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
      select: {
        id: true,
        quantity: true,
        type: true,
        reason: true,
        createdAt: true,
        variant: {
          select: {
            name: true,
            product: {
              select: {
                name: true
              }
            },
            color: {
              select: {
                name: true
              }
            },
            size: {
              select: {
                name: true
              }
            }
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