import prismadb from "@/lib/prismadb";
import { OptionValuesClient } from "./components/client";
import { format } from "date-fns";

const OptionValuesPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const optionValues = await prismadb.optionValue.findMany({
    where: {
      optionType: {
        product: {
          storeId: params.storeId,
        }
      }
    },
    include: {
      optionType: {
        include: {
          product: true,
        }
      },
    },
    orderBy: {
      position: 'asc',
    }
  });

  const formattedOptionValues = optionValues.map((value) => ({
    id: value.id,
    name: value.name,
    presentation: value.presentation,
    optionTypeName: value.optionType.name,
    productName: value.optionType.product.name,
    position: value.position,
    createdAt: format(value.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OptionValuesClient data={formattedOptionValues} />
      </div>
    </div>
  );
};

export default OptionValuesPage; 