'use client';

import { Loader } from "@/components/ui/loader";
import { TaxonomyForm } from "./components/taxonomy-form";
import { TaxonForm } from "./components/taxon-form";
import { TaxonTree } from "@/components/ui/taxon-tree";
import { useTaxonomyDetails } from "@/hooks/use-taxonomy-details";
import { useParams } from "next/navigation";

const TaxonomyPage = () => {
  const params = useParams();
  const { data: taxonomy, loading, error } = useTaxonomyDetails(
    params.storeId as string,
    params.taxonomyId as string
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  if (!taxonomy) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Taxonomy not found.</p>
      </div>
    );
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <TaxonomyForm initialData={taxonomy} />
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Taxons in {taxonomy.name}</h2>
            <TaxonForm 
              taxonomyId={params.taxonomyId as string}
              storeId={params.storeId as string}
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
};

export default TaxonomyPage;
