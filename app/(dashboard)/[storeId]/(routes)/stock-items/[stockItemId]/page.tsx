import prismadb from "@/lib/prismadb";
import { StockItemForm } from "./components/stock-item-form";

const StockItemPage = async ({
  params
}: {
  params: { stockItemId: string, storeId: string }
}) => {
  const stockItem = params.stockItemId === "new" ? null : await prismadb.stockItem.findUnique({
    where: {
      id: params.stockItemId
    },
    include: {
      variant: {
        include: {
          product: true,
          color: true,
          size: true
        }
      }
    }
  });

  const variants = await prismadb.variant.findMany({
    where: {
      product: {
        storeId: params.storeId
      }
    },
    include: {
      product: true,
      color: true,
      size: true
    }
  });

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <StockItemForm 
          initialData={stockItem}
          variants={variants}
        />
      </div>
    </div>
  );
}

export default StockItemPage; 