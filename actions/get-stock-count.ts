import prismadb from "@/lib/prismadb";

export const getStockCount = async (storeId: string) => {
  const stockCount = await prismadb.product.count({
    where: {
      storeId,
      status: {
        not: 'archived'
      }
    }
  });

  return stockCount;
};
