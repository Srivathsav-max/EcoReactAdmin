import prismadb from "@/lib/prismadb";
import { TaxonsClient } from "./components/client";
import { Taxonomy, Taxon } from "@prisma/client";
import { ApiList } from "@/components/ui/api-list";
import { formatDecimalPrice } from "@/lib/utils";

interface TaxonomyWithTaxons extends Taxonomy {
  taxons: (Taxon & {
    children: Taxon[];
  })[];
}

const TaxonsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const taxonomiesWithTaxons = await prismadb.taxonomy.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      taxons: {
        where: {
          parentId: null // Only get root level taxons
        },
        include: {
          children: {
            include: {
              children: true
            }
          }
        },
        orderBy: {
          position: 'asc'
        }
      }
    }
  }) as TaxonomyWithTaxons[];

  const rawProducts = await prismadb.product.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      taxons: true
    }
  });

  // Format products to handle Decimal type
  const products = rawProducts.map(product => ({
    ...product,
    price: formatDecimalPrice(product.price)
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <TaxonsClient
          taxonomies={taxonomiesWithTaxons}
          products={products}
        />
        <ApiList entityName="taxons" entityIdName="taxonId" />
      </div>
    </div>
  );
};

export default TaxonsPage;
