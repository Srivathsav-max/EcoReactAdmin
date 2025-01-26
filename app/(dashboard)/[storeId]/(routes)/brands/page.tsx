import { format } from "date-fns";
import { Brand } from "@prisma/client";

import prismadb from "@/lib/prismadb";

import { BrandsClient } from "./components/client";
import { BrandColumn } from "./components/columns";

const BrandsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const brands = await prismadb.brand.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedBrands: BrandColumn[] = brands.map((item: Brand) => ({
    id: item.id,
    name: item.name,
    website: item.website,
    isActive: item.isActive,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BrandsClient data={formattedBrands} />
      </div>
    </div>
  );
};

export default BrandsPage; 