import prismadb from "@/lib/prismadb";

import { AttributeValueForm } from "./components/attribute-value-form";

const AttributeValuePage = async ({
  params
}: {
  params: { valueId: string, storeId: string }
}) => {
  const attributeValue = await prismadb.attributeValue.findUnique({
    where: {
      id: params.valueId
    }
  });

  const attributes = await prismadb.attribute.findMany({
    where: {
      storeId: params.storeId
    }
  });

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <AttributeValueForm 
          initialData={attributeValue}
          attributes={attributes}
        />
      </div>
    </div>
  );
}

export default AttributeValuePage; 