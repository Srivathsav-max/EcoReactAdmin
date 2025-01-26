import prismadb from "@/lib/prismadb";
import { OptionValueForm } from "./components/option-value-form";

const OptionValuePage = async ({
  params
}: {
  params: { optionValueId: string, storeId: string }
}) => {
  const optionValue = params.optionValueId === 'new' ? null : await prismadb.optionValue.findUnique({
    where: {
      id: params.optionValueId,
    }
  });

  const optionTypes = await prismadb.productOptionType.findMany({
    where: {
      product: {
        storeId: params.storeId,
      }
    },
    include: {
      product: true,
    }
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OptionValueForm 
          initialData={optionValue}
          optionTypes={optionTypes}
        />
      </div>
    </div>
  );
}

export default OptionValuePage; 