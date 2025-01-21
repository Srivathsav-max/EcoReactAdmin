import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { StockItemClient } from "./components/client";
import { StockItemColumn } from "./components/columns";
import { formatPrice } from "@/lib/utils";

const StockItemsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const stockItems = await prismadb.stockItem.findMany({
    where: {
      storeId: params.storeId
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

  const formattedStockItems: StockItemColumn[] = stockItems.map((item) => ({
    id: item.id,
    productName: item.variant.product.name,
    variantName: item.variant.name,
    color: item.variant.color?.name || 'N/A',
    size: item.variant.size?.name || 'N/A',
    count: item.count,
    reserved: item.reserved,
    backorderedQty: item.backorderedQty,
    stockStatus: item.stockStatus,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <StockItemClient data={formattedStockItems} />
      </div>
    </div>
  );
};

export default StockItemsPage; 