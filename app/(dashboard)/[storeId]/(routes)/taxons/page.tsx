import prismadb from "@/lib/prismadb";
import { TaxonsClient } from "./components/client";
import { Taxonomy, Taxon } from "@prisma/client";

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

  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      taxons: true
    }
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <TaxonsClient 
          taxonomies={taxonomiesWithTaxons}
          products={products}
        />
      </div>
    </div>
  );
};

export default TaxonsPage;
