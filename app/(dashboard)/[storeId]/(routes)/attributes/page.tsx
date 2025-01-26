import { format } from "date-fns";
import { Attribute } from "@prisma/client";

import prismadb from "@/lib/prismadb";
import { AttributesClient } from "./components/client";
import { AttributeColumn } from "./components/columns";

const AttributesPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const { storeId } = await params;
  
  const attributes = await prismadb.attribute.findMany({
    where: {
      storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedAttributes: AttributeColumn[] = attributes.map((item: Attribute) => ({
    id: item.id,
    name: item.name,
    code: item.code,
    type: item.type,
    isRequired: item.isRequired,
    isVisible: item.isVisible,
    position: item.position,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <AttributesClient data={formattedAttributes} />
      </div>
    </div>
  );
};

export default AttributesPage;