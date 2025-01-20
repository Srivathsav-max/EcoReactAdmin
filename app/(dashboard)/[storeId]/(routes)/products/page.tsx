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
      storeId: params.storeId
    },
    include: {
      size: true,
      color: true,
      images: true,
      taxons: {
        include: {
          taxonomy: true // Include the taxonomy relation
        }
      },
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log('Raw products sample:', {
    first: products[0],
    priceType: products[0]?.price ? typeof products[0].price : 'no price',
    isDecimal: products[0]?.price instanceof Decimal,
  });

  // Convert Decimal to number and format products
  const formattedProducts = products.map((item) => {
    console.log('Processing product:', {
      id: item.id,
      priceType: typeof item.price,
      priceValue: item.price,
      isDecimal: item.price instanceof Decimal
    });

    const numericPrice = formatDecimalPrice(item.price);
    console.log('Converted price:', {
      before: item.price,
      after: numericPrice
    });

    const categories = item.taxons.map(taxon => 
      `${taxon.taxonomy?.name || 'Unknown'}: ${taxon.name}`
    ).join(", ");

    return {
      id: item.id,
      name: item.name,
      isFeatured: item.isFeatured,
      isArchived: item.isArchived,
      price: numericPrice.toString(),
      priceFormatted: formatter.format(numericPrice),
      currencySymbol: store.currency === 'USD' ? '$' : '€',
      rawPrice: numericPrice,
      size: item.size.name,
      color: item.color.value,
      category: categories || "No categories",
      createdAt: format(item.createdAt, 'MMMM do, yyyy'),
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
