import prismadb from "@/lib/prismadb";
import { TaxonsClient } from "./components/client";

const TaxonsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  // Get all taxons for this store grouped by taxonomy
  const taxons = await prismadb.taxon.findMany({
    where: {
      taxonomy: {
        storeId: params.storeId
      }
    },
    include: {
      taxonomy: true,
      children: {
        include: {
          children: {
            include: {
              children: true
            }
          }
        }
      },
      parent: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Group taxons by taxonomy
  const taxonomiesWithTaxons = Object.values(
    taxons.reduce((acc: any, taxon) => {
      if (!acc[taxon.taxonomy?.id || '']) {
        acc[taxon.taxonomy?.id || ''] = {
          id: taxon.taxonomy?.id,
          name: taxon.taxonomy?.name,
          taxons: []
        };
      }
      // Only add root level taxons (those without parents)
      if (!taxon.parentId) {
        acc[taxon.taxonomy?.id || ''].taxons.push(taxon);
      }
      return acc;
    }, {})
  );

  // Fetch products for product counts
  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
      isArchived: false
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
