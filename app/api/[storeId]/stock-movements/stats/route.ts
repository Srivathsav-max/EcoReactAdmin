import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Get all stock items for the store
    const stockItems = await prismadb.stockItem.findMany({
      where: {
        storeId: params.storeId,
      },
      include: {
        variant: true,
      },
    });

    // Calculate total stock value
    const totalStockValue = stockItems.reduce((total, item) => {
      const costPrice = item.variant.costPrice || 0;
      return total + (Number(costPrice) * item.count);
    }, 0);

    // Count low stock items
    const lowStockCount = stockItems.reduce((count, item) => {
      return count + (item.count <= (item.variant.lowStockAlert || 5) ? 1 : 0);
    }, 0);

    // Get stock movements for the last 30 days
    const recentMovements = await prismadb.stockMovement.findMany({
      where: {
        stockItem: {
          storeId: params.storeId,
        },
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get stock movements for the previous 30 days (for comparison)
    const previousMovements = await prismadb.stockMovement.findMany({
      where: {
        stockItem: {
          storeId: params.storeId,
        },
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    });

    // Calculate stock in movements (received, returned, transfer_in)
    const stockIn30Days = recentMovements
      .filter(m => ['received', 'returned', 'transfer_in'].includes(m.type))
      .reduce((total, m) => total + m.quantity, 0);

    const stockInPrevious = previousMovements
      .filter(m => ['received', 'returned', 'transfer_in'].includes(m.type))
      .reduce((total, m) => total + m.quantity, 0);

    // Calculate stock out movements (shipped, damaged, transfer_out)
    const stockOut30Days = recentMovements
      .filter(m => ['shipped', 'damaged', 'transfer_out'].includes(m.type))
      .reduce((total, m) => total + Math.abs(m.quantity), 0);

    const stockOutPrevious = previousMovements
      .filter(m => ['shipped', 'damaged', 'transfer_out'].includes(m.type))
      .reduce((total, m) => total + Math.abs(m.quantity), 0);

    // Calculate percentage changes
    const stockIn30DaysChange = stockInPrevious === 0 
      ? 100 
      : Math.round(((stockIn30Days - stockInPrevious) / stockInPrevious) * 100);

    const stockOut30DaysChange = stockOutPrevious === 0 
      ? 100 
      : Math.round(((stockOut30Days - stockOutPrevious) / stockOutPrevious) * 100);

    return NextResponse.json({
      totalStockValue,
      stockIn30Days,
      stockIn30DaysChange,
      stockOut30Days,
      stockOut30DaysChange,
      lowStockCount,
    });
  } catch (error) {
    console.log('[STOCK_MOVEMENTS_STATS]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
