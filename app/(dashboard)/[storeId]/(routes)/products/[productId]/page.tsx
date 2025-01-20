import prismadb from "@/lib/prismadb";
import { ProductForm } from "./components/product-form";
import { Decimal } from "@prisma/client/runtime/library";

const ProductPage = async ({
  params
}: {
  params: { productId: string, storeId: string }
}) => {
  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      images: true,
      taxons: true,
    }
  });

  // Only format the product if it exists, keeping the Decimal type intact
  const formattedProduct = product ? {
    ...product,
    // Preserve the Decimal type for price
    price: new Decimal(product.price.toString())
  } : null;

  const sizes = await prismadb.size.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const colors = await prismadb.color.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const taxonomies = await prismadb.taxonomy.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      taxons: {
        include: {
          children: {
            include: {
              children: true // Goes 3 levels deep
            }
          }
        }
      }
    }
  });

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm 
          colors={colors}
          sizes={sizes}
          initialData={formattedProduct}
          taxonomies={taxonomies}
          initialTaxons={product?.taxons || []}
        />
      </div>
    </div>
  );
}

export default ProductPage;
