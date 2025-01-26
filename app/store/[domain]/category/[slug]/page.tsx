import { notFound } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { formatProducts } from "@/lib/price-formatter";
import { type Product } from "@/types/models";
import { Billboard } from "../../components/billboard";
import { ProductsGrid } from "../../components/products-grid";

interface CategoryPageProps {
  params: {
    domain: string;
    slug: string;
  };
  searchParams: {
    colorId: string;
    sizeId: string;
    brandId: string;
    sort: string;
  };
}

const CategoryPage = async ({ params, searchParams }: CategoryPageProps) => {
  // Get store and validate
  const store = await prismadb.store.findFirst({
    where: {
      domain: params.domain,
    },
  });

  if (!store) {
    return notFound();
  }

  // Find the taxon with its store context
  const taxon = await prismadb.taxon.findFirst({
    where: {
      permalink: params.slug,
      taxonomy: {
        storeId: store.id,
      },
    },
    include: {
      billboard: true,
    },
  });

  if (!taxon) {
    return notFound();
  }

  // Build filter conditions
  const whereClause: any = {
    storeId: store.id,
    isVisible: true,
    taxons: {
      some: {
        id: taxon.id,
      },
    },
  };

  if (searchParams.brandId) {
    whereClause.brandId = searchParams.brandId;
  }

  if (searchParams.colorId || searchParams.sizeId) {
    whereClause.variants = {
      some: {
        isVisible: true,
        ...(searchParams.colorId && { colorId: searchParams.colorId }),
        ...(searchParams.sizeId && { sizeId: searchParams.sizeId }),
      },
    };
  }

  // Get products with variants and related data
  const rawProducts = await prismadb.product.findMany({
    where: whereClause,
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
      taxons: {
        include: {
          taxonomy: true,
        },
      },
      optionTypes: {
        include: {
          optionValues: true,
        },
      },
    },
    orderBy: {
      ...(searchParams.sort === "price-asc" && { price: "asc" }),
      ...(searchParams.sort === "price-desc" && { price: "desc" }),
      ...((!searchParams.sort || searchParams.sort === "newest") && {
        createdAt: "desc",
      }),
    },
  });

  // Format products with proper price handling
  const products = formatProducts(rawProducts);

  // Get available filters
  const sizes = await prismadb.size.findMany({
    where: {
      storeId: store.id,
    },
  });

  const colors = await prismadb.color.findMany({
    where: {
      storeId: store.id,
    },
  });

  const brands = await prismadb.brand.findMany({
    where: {
      storeId: store.id,
      isActive: true,
    },
  });

  return (
    <div className="pb-10">
      {taxon.billboard && (
        <Billboard data={taxon.billboard} />
      )}
      <div className="px-4 sm:px-6 lg:px-8 pb-24">
        <ProductsGrid
          title={taxon.name}
          items={products}
          sizes={sizes}
          colors={colors}
          brands={brands}
          searchParams={searchParams}
        />
      </div>
    </div>
  );
};

export default CategoryPage;