import prismadb from "@/lib/prismadb";
import { TaxonomyForm } from "./components/taxonomy-form";
import { TaxonForm } from "./components/taxon-form";
import { TaxonTree } from "@/components/ui/taxon-tree";

const TaxonomyPage = async ({
  params
}: {
  params: { taxonomyId: string, storeId: string }
}) => {
  // Get the taxonomy with root-level taxons and their complete hierarchy
  const taxonomy = await prismadb.taxonomy.findUnique({
    where: {
      id: params.taxonomyId
    },
    include: {
      taxons: {
        where: {
          parentId: null // Only get root level taxons
        },
        include: {
          children: {
            include: {
              children: {
                include: {
                  children: true // Goes 3 levels deep
                }
              }
            }
          },
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: [
          { position: 'asc' },
          { createdAt: 'desc' }
        ]
      }
    }
  });

  if (!taxonomy) {
    return null;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <TaxonomyForm initialData={taxonomy} />
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Taxons in {taxonomy.name}</h2>
            <TaxonForm 
              taxonomyId={params.taxonomyId}
              storeId={params.storeId}
            />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            {taxonomy.taxons && taxonomy.taxons.length > 0 ? (
              <div className="space-y-4">
                {taxonomy.taxons.map((taxon) => (
                  <TaxonTree 
                    key={taxon.id} 
                    taxon={taxon}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No taxons created yet in this taxonomy.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaxonomyPage;
