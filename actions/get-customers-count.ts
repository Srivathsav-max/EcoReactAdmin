import prismadb from "@/lib/prismadb";

const getCustomersCount = async (storeId: string) => {
  const customersCount = await prismadb.customer.count({
    where: {
      storeId,
    }
  });
  
  return customersCount;
};

export default getCustomersCount;
