import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { AttributeValuesClient } from "./components/client";
import { AttributeValueColumn } from "./components/columns";

const AttributeValuesPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const attributeValues = await prismadb.attributeValue.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      attribute: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedValues: AttributeValueColumn[] = attributeValues.map((item) => ({
    id: item.id,
    value: item.value,
    attributeId: item.attributeId,
    attributeName: item.attribute.name,
    position: item.position,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <AttributeValuesClient data={formattedValues} />
      </div>
    </div>
  );
};

export default AttributeValuesPage; 