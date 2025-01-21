import prismadb from "@/lib/prismadb";
import { VariantForm } from "./components/variant-form";

const VariantPage = async ({
  params
}: {
  params: { variantId: string, storeId: string }
}) => {
  // Fetch the variant if editing
  const variant = params.variantId === "new" ? null : await prismadb.variant.findUnique({
    where: {
      id: params.variantId
    }
  });

  // Fetch all products for the store
  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Fetch colors for the store
  const colors = await prismadb.color.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Fetch sizes for the store
  const sizes = await prismadb.size.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Format the variant data if it exists
  const formattedVariant = variant ? {
    ...variant,
    price: parseFloat(variant.price.toString()),
    costPrice: variant.costPrice ? parseFloat(variant.costPrice.toString()) : undefined,
    compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice.toString()) : undefined,
  } : null;

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <VariantForm 
          initialData={formattedVariant}
          products={products}
          colors={colors}
          sizes={sizes}
        />
      </div>
    </div>
  );
}

export default VariantPage; 