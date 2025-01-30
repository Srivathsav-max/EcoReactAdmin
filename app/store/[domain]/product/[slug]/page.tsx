import { notFound } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { formatProduct, formatProducts } from "@/lib/price-formatter";
import { type Product } from "@/types/models";
import { ProductsCarousel } from "../../components/products-carousel";
import { ProductDisplay } from "../../components/product-display";

interface ProductPageProps {
  params: {
    domain: string;
    slug: string;
  };
}

const ProductPage = async ({ params }: ProductPageProps) => {
  // Get store and validate
  const store = await prismadb.store.findFirst({
    where: {
      domain: params.domain,
    },
  });

  if (!store) {
    return notFound();
  }

  // Get the product with its variants and related data
  const rawProduct = await prismadb.product.findFirst({
    where: {
      slug: params.slug,
      storeId: store.id,
      isVisible: true,
    },
    include: {
      images: true,
      variants: {
        where: { isVisible: true },
        include: {
          images: true,
          size: true,
          color: true,
          stockItems: true,
          optionValues: {
            include: {
              optionValue: {
                include: {
                  optionType: true,
                },
              },
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      },
      brand: true,
      optionTypes: {
        include: {
          optionValues: true,
        },
      },
      taxons: {
        include: {
          taxonomy: true,
        },
      },
    },
  });

  if (!rawProduct) {
    return notFound();
  }

  // Format all prices and data types
  const product = formatProduct(rawProduct);

  // Get related products from the same categories
  const rawRelatedProducts = await prismadb.product.findMany({
    where: {
      storeId: store.id,
      isVisible: true,
      taxons: {
        some: {
          id: {
            in: product.taxons.map((t) => t.id),
          },
        },
      },
      NOT: {
        id: product.id,
      },
    },
    include: {
      images: true,
      variants: {
        where: { isVisible: true },
        include: {
          images: true,
          size: true,
          color: true,
          stockItems: true,
          optionValues: {
            include: {
              optionValue: {
                include: {
                  optionType: true,
                },
              },
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      },
      brand: true,
      optionTypes: {
        include: {
          optionValues: true,
        },
      },
      taxons: {
        include: {
          taxonomy: true,
        },
      },
    },
    take: 4,
  });

  // Format related products
  const relatedProducts = formatProducts(rawRelatedProducts);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-2 md:items-start md:gap-x-8">
          <ProductDisplay product={product} />
        </div>
        <hr className="my-10" />
        <ProductsCarousel title="Related Items" items={relatedProducts} />
      </div>
    </div>
  );
};

export default ProductPage;
