import prismadb from "@/lib/prismadb";

import { AttributeForm } from "./components/attribute-form";

const AttributePage = async ({
  params
}: {
  params: { attributeId: string }
}) => {
  const attribute = await prismadb.attribute.findUnique({
    where: {
      id: params.attributeId
    }
  });

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <AttributeForm initialData={attribute} />
      </div>
    </div>
  );
}

export default AttributePage; 