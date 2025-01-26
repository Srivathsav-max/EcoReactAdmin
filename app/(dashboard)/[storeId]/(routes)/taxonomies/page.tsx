'use client';

import { TaxonomiesClient } from "./components/client";
import { ApiList } from "@/components/ui/api-list";
import { useTaxonomies } from "@/hooks/use-taxonomies";
import { useParams } from "next/navigation";
import { Loader } from "@/components/ui/loader";

const TaxonomiesPage = () => {
  const params = useParams();
  const { data: taxonomies, loading, error } = useTaxonomies(params.storeId as string);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <TaxonomiesClient data={taxonomies} />
        <ApiList entityName="taxonomies" entityIdName="taxonomyId" />
      </div>
    </div>
  );
};

export default TaxonomiesPage;
