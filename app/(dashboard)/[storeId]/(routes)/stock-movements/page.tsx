import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { StockMovementClient } from "./components/client";
import { StockMovementColumn, StockMovementType } from "./components/columns";

const ITEMS_PER_PAGE = 100;

const VALID_MOVEMENT_TYPES = [
  'received',
  'shipped',
  'returned',
  'adjustment',
  'transfer_in',
  'transfer_out',
  'damaged',
  'correction'
] as const;

const validateMovementType = (type: string): StockMovementType => {
  if (VALID_MOVEMENT_TYPES.includes(type as StockMovementType)) {
    return type as StockMovementType;
  }
  // Default to adjustment if an unknown type is encountered
  console.warn(`Unknown stock movement type: ${type}, defaulting to 'adjustment'`);
  return 'adjustment';
};

const StockMovementsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const { storeId } = params;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  // Get stock statistics
  const stockItems = await prismadb.stockItem.findMany({
    where: {
      storeId: storeId,
    },
    include: {
      variant: true,
    },
  });

  // Calculate total stock value and low stock count
  const totalStockValue = stockItems.reduce((total, item) => {
    const costPrice = item.variant.costPrice || 0;
    return total + (Number(costPrice) * item.count);
  }, 0);

  const lowStockCount = stockItems.reduce((count, item) => {
    return count + (item.count <= (item.variant.lowStockAlert || 5) ? 1 : 0);
  }, 0);

  // Get stock movements for the last 30 days and previous 30 days
  const [recentMovements, previousMovements] = await Promise.all([
    prismadb.stockMovement.findMany({
      where: {
        stockItem: {
          storeId: storeId,
        },
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    }),
    prismadb.stockMovement.findMany({
      where: {
        stockItem: {
          storeId: storeId,
        },
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    })
  ]);

  // Calculate stock trends
  const stockIn30Days = recentMovements
    .filter(m => ['received', 'returned', 'transfer_in'].includes(m.type))
    .reduce((total, m) => total + m.quantity, 0);

  const stockInPrevious = previousMovements
    .filter(m => ['received', 'returned', 'transfer_in'].includes(m.type))
    .reduce((total, m) => total + m.quantity, 0);

  const stockOut30Days = recentMovements
    .filter(m => ['shipped', 'damaged', 'transfer_out'].includes(m.type))
    .reduce((total, m) => total + Math.abs(m.quantity), 0);

  const stockOutPrevious = previousMovements
    .filter(m => ['shipped', 'damaged', 'transfer_out'].includes(m.type))
    .reduce((total, m) => total + Math.abs(m.quantity), 0);

  const stockIn30DaysChange = stockInPrevious === 0 
    ? 100 
    : Math.round(((stockIn30Days - stockInPrevious) / stockInPrevious) * 100);

  const stockOut30DaysChange = stockOutPrevious === 0 
    ? 100 
    : Math.round(((stockOut30Days - stockOutPrevious) / stockOutPrevious) * 100);

  // Fetch stock movements for display
  const stockMovements = await prismadb.stockMovement.findMany({
    take: ITEMS_PER_PAGE,
    where: {
      stockItem: {
        storeId: storeId
      }
    },
    include: {
      stockItem: {
        include: {
          variant: {
            include: {
              product: true,
              color: true,
              size: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedMovements: StockMovementColumn[] = stockMovements.map((item) => ({
    id: item.id,
    productName: item.stockItem.variant.product.name,
    variantName: item.stockItem.variant.name,
    color: item.stockItem.variant.color?.name || 'N/A',
    size: item.stockItem.variant.size?.name || 'N/A',
    quantity: item.quantity,
    type: validateMovementType(item.type),
    reason: item.reason || 'N/A',
    originatorId: item.originatorId,
    originatorType: item.originatorType,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <StockMovementClient 
          data={formattedMovements} 
          stats={{
            totalStockValue,
            stockIn30Days,
            stockIn30DaysChange,
            stockOut30Days,
            stockOut30DaysChange,
            lowStockCount
          }}
        />
      </div>
    </div>
  );
};

export default StockMovementsPage;
