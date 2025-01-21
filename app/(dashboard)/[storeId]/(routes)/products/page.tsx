import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { formatPrice, formatPriceString, getCurrencySymbol, formatDecimalPrice, getFormatter } from "@/lib/utils";
import { ProductClient } from "./components/client";
import { ApiList } from "@/components/ui/api-list";
import { Decimal } from "@prisma/client/runtime/library";

const ProductsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  console.log('=== Debug: Starting ProductsPage ===');
  
  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId
    }
  });

  console.log('Store settings:', {
    currency: store?.currency,
    locale: store?.locale
  });

  if (!store) {
    throw new Error("Store not found");
  }

  const formatter = getFormatter({
    currency: store.currency || 'USD',
    locale: store.locale || 'en-US'
  });

  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      images: true,
      taxons: {
        include: {
          taxonomy: true
        }
      },
      variants: {
        include: {
          size: true,
          color: true,
          stockItems: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  console.log('Raw products sample:', {
    first: products[0],
    priceType: products[0]?.price ? typeof products[0].price : 'no price',
    isDecimal: products[0]?.price instanceof Decimal,
  });

  const formattedProducts = products.map((product) => {
    const mainVariant = product.variants[0];
    const numericPrice = product.price ? formatDecimalPrice(product.price) : 0;
    const categories = product.taxons.map(taxon => 
      `${taxon.taxonomy?.name || 'Unknown'}: ${taxon.name}`
    ).join(", ");

    return {
      id: product.id,
      name: product.name,
      price: numericPrice.toString(),
      priceFormatted: formatter.format(numericPrice),
      currencySymbol: store.currency === 'USD' ? '$' : '€',
      rawPrice: numericPrice,
      size: mainVariant?.size?.name || 'N/A',
      color: mainVariant?.color?.name || 'N/A',
      isFeatured: product.status === 'active',
      isArchived: product.status === 'archived',
      category: categories || "No categories",
      slug: product.slug,
      sku: product.sku || 'N/A',
      description: product.description || '',
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      status: product.status,
      stockCount: mainVariant?.stockItems.reduce((total, item) => total + item.count, 0) || 0,
      createdAt: format(product.createdAt, 'MMMM do, yyyy'),
      availableOn: product.availableOn ? format(product.availableOn, 'MMMM do, yyyy') : 'Not set',
      discontinueOn: product.discontinueOn ? format(product.discontinueOn, 'MMMM do, yyyy') : 'Not set',
    };
  });

  console.log('=== Debug: Completed formatting ===');
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductClient 
          data={formattedProducts} 
          storeCurrency={store.currency || 'USD'}
        />
        <ApiList entityName="products" entityIdName="productId" />
      </div>
    </div>
  );
};

export default ProductsPage;
