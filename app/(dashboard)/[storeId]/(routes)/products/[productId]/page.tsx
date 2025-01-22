import prismadb from "@/lib/prismadb";
import { ProductTabs } from "./components/product-tabs";

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

  const product = params.productId === "new" ? null : await prismadb.product.findUnique({
    where: {
      id: params.productId
    },
    include: {
      images: true,
      taxons: true,
      variants: {
        include: {
          color: true,
          size: true,
          stockItems: true
        }
      },
      properties: true
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

  const brands = await prismadb.brand.findMany();

  // Format the variant data if it exists
  const formattedProduct = product ? {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price ? parseFloat(product.price.toString()) : 0,
    costPrice: product.costPrice ? parseFloat(product.costPrice.toString()) : null,
    compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice.toString()) : null,
    taxRate: product.taxRate ? parseFloat(product.taxRate.toString()) : null,
    weight: product.weight ? parseFloat(product.weight.toString()) : null,
    height: product.height ? parseFloat(product.height.toString()) : null,
    width: product.width ? parseFloat(product.width.toString()) : null,
    depth: product.depth ? parseFloat(product.depth.toString()) : null,
    status: product.status,
    images: product.images,
    taxons: product.taxons,
    variants: product.variants?.map(variant => ({
      ...variant,
      price: parseFloat(variant.price.toString())
    })),
    properties: product.properties,
    // SEO fields
    slug: product.slug || "",
    metaTitle: product.metaTitle || "",
    metaDescription: product.metaDescription || "",
    metaKeywords: product.metaKeywords || "",
    // Shipping fields
    shippingCategory: product.shippingCategory || ""
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
              children: true
            }
          }
        }
      }
    }
  });

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductTabs
          initialData={formattedProduct}
          sizes={sizes}
          colors={colors}
          taxonomies={taxonomies}
          initialTaxons={product?.taxons || []}
          storeCurrency={store.currency || 'USD'}
          storeLocale={store.locale || 'en-US'}
          brands={brands}
        />
      </div>
    </div>
  );
}

export default ProductPage;
