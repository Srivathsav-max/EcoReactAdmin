import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { VariantsClient } from "./components/client";
import { formatPrice } from "@/lib/utils";

const VariantsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const variants = await prismadb.variant.findMany({
    where: {
      product: {
        storeId: params.storeId
      }
    },
    include: {
      product: true,
      size: true,
      color: true,
      stockItems: true,
      images: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  const formattedVariants = variants.map((variant) => ({
    id: variant.id,
    productName: variant.product.name,
    sku: variant.sku,
    price: formatPrice(variant.price),
    size: variant.size?.name || 'N/A',
    color: variant.color?.name || 'N/A',
    stockCount: variant.stockItems.reduce((sum, item) => sum + item.count, 0),
    createdAt: format(variant.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <VariantsClient data={formattedVariants} />
      </div>
    </div>
  );
};

export default VariantsPage; 