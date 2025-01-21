import { format } from "date-fns";
import prismadb from "@/lib/prismadb";

import { OptionTypeColumn } from "./components/columns";
import { OptionTypesClient } from "./components/client";

const OptionTypesPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const optionTypes = await prismadb.optionType.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      product: true,
      optionValues: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedOptionTypes: OptionTypeColumn[] = optionTypes.map((type) => ({
    id: type.id,
    name: type.name,
    presentation: type.presentation,
    productName: type.product.name,
    position: type.position,
    valuesCount: type.optionValues.length,
    createdAt: format(type.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OptionTypesClient data={formattedOptionTypes} />
      </div>
    </div>
  );
};

export default OptionTypesPage; 