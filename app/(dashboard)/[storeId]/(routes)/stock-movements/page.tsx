import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { StockMovementClient } from "./components/client";
import { StockMovementColumn } from "./components/columns";

const StockMovementsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const stockMovements = await prismadb.stockMovement.findMany({
    where: {
      variant: {
        product: {
          storeId: params.storeId
        }
      }
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

  const formattedMovements: StockMovementColumn[] = stockMovements.map((item) => ({
    id: item.id,
    productName: item.variant.product.name,
    variantName: item.variant.name,
    color: item.variant.color?.name || 'N/A',
    size: item.variant.size?.name || 'N/A',
    quantity: item.quantity,
    type: item.type,
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