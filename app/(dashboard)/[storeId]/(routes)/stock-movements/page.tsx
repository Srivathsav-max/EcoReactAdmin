import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { StockMovementClient } from "./components/client";
import { StockMovementColumn, StockMovementType } from "./components/columns";

const ITEMS_PER_PAGE = 100;

const StockMovementsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  // Fetch only essential fields and limit the number of records
  const stockMovements = await prismadb.stockMovement.findMany({
    take: ITEMS_PER_PAGE,
    where: {
      variant: {
        product: {
          storeId: params.storeId
        }
      }
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

  const formattedMovements: StockMovementColumn[] = stockMovements.map((item) => ({
    id: item.id,
    productName: item.variant.product.name,
    variantName: item.variant.name,
    color: item.variant.color?.name || 'N/A',
    size: item.variant.size?.name || 'N/A',
    quantity: item.quantity,
    type: item.type as StockMovementType, // Type assertion since we know the values are constrained in the database
    reason: item.reason || 'N/A',
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <StockMovementClient data={formattedMovements} />
      </div>
    </div>
  );
};

export default StockMovementsPage;