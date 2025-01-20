import prismadb from "@/lib/prismadb";
import { ProductForm } from "./components/product-form";

const ProductPage = async ({
  params
}: {
  params: { productId: string, storeId: string }
}) => {
  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId
    }
  });

  if (!store) {
    throw new Error("Store not found");
  }

  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId
    },
    include: {
      images: true,
      taxons: true
    }
  });

  const sizes = await prismadb.size.findMany({
    where: {
      storeId: params.storeId
    }
  });

  const colors = await prismadb.color.findMany({
    where: {
      storeId: params.storeId
    }
  });

  // Convert Decimal to number for the form
  const formattedProduct = product ? {
    ...product,
    price: parseFloat(product.price.toString())
  } : null;

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
          initialData={formattedProduct}
          sizes={sizes}
          colors={colors}
          taxonomies={taxonomies}
          initialTaxons={product?.taxons || []}
          storeCurrency={store.currency || 'USD'}
          storeLocale={store.locale || 'en-US'}
        />
      </div>
    </div>
  );
}

export default ProductPage;
