import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getAdminSession } from "@/lib/auth";

// Valid stock movement types
const STOCK_MOVEMENT_TYPES = [
  'received',     // Stock received from supplier
  'reserved',     // Stock reserved for order
  'unreserved',   // Stock reservation cancelled
  'shipped',      // Stock shipped to customer
  'returned',     // Stock returned by customer
  'adjustment',   // Manual stock adjustment
  'transfer_in',  // Stock transferred in from another location
  'transfer_out', // Stock transferred out to another location
  'damaged',      // Stock marked as damaged/unsellable
  'correction'    // Correction to fix inventory discrepancy
] as const;

type StockMovementType = typeof STOCK_MOVEMENT_TYPES[number];

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
      reason,
      orderId,
      originatorId,
      originatorType
    } = body;

    if (!type || !STOCK_MOVEMENT_TYPES.includes(type)) {
      return new NextResponse("Valid movement type is required", { status: 400 });
    }

    if (typeof quantity !== 'number' || quantity === 0) {
      return new NextResponse("Quantity is required and must be a non-zero number", { status: 400 });
    }

    // Validate required fields based on movement type
    if (['shipped', 'returned'].includes(type) && !orderId) {
      return new NextResponse("Order ID is required for shipped/returned movements", { status: 400 });
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

    // Validate available stock for outgoing movements
    const availableStock = stockItem.count - stockItem.reserved;
    if (['shipped', 'transfer_out', 'damaged'].includes(type) && quantity > availableStock) {
      return new NextResponse("Insufficient available stock", { status: 400 });
    }

    // Calculate new stock and reservation counts
    let newCount = stockItem.count;
    let newReserved = stockItem.reserved;
    
    switch (type) {
      case 'received':
      case 'returned':
      case 'transfer_in':
        newCount += quantity;
        break;
      case 'reserved':
        if (quantity > availableStock) {
          return new NextResponse("Cannot reserve more than available stock", { status: 400 });
        }
        newReserved += quantity;
        break;
      case 'unreserved':
        if (quantity > stockItem.reserved) {
          return new NextResponse("Cannot unreserve more than reserved quantity", { status: 400 });
        }
        newReserved -= quantity;
        break;
      case 'shipped':
        if (quantity > stockItem.reserved) {
          return new NextResponse("Cannot ship more than reserved quantity", { status: 400 });
        }
        newCount -= quantity;
        newReserved -= quantity;
        break;
      case 'transfer_out':
      case 'damaged':
        newCount -= quantity;
        break;
      case 'adjustment':
      case 'correction':
        newCount += quantity; // Can be positive or negative
        break;
    }

    // Create stock movement and update stock counts in a transaction
    const movementData = {
      type,
      quantity,
      stockItemId,
      variantId: stockItem.variantId,
      reason: orderId ? `Order #${orderId} - ${reason || ''}` : reason || null,
      ...(originatorId && { originatorId }),
      ...(originatorType && { originatorType })
    };

    const [stockMovement] = await prismadb.$transaction([
      prismadb.stockMovement.create({
        data: movementData
      }),
      prismadb.stockItem.update({
        where: { id: stockItemId },
        data: {
          count: newCount,
          reserved: newReserved,
          stockStatus: newCount > 0 ? (newCount > (stockItem.variant.lowStockAlert || 0) ? 'in_stock' : 'low_stock') : 'out_of_stock',
          updatedAt: new Date()
        }
      })
    ]);

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
