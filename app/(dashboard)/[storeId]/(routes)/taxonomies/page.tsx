import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { TaxonomiesClient } from "./components/client";
import { ApiList } from "@/components/ui/api-list";

const TaxonomiesPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const taxonomies = await prismadb.taxonomy.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      _count: {
        select: {
          taxons: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedTaxonomies = taxonomies.map((item) => ({
    id: item.id,
    name: item.name,
    taxonsCount: item._count.taxons,
    createdAt: format(item.createdAt, "MMMM do, yyyy")
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <TaxonomiesClient data={formattedTaxonomies} />
        <ApiList entityName="taxonomies" entityIdName="taxonomyId" />
      </div>
    </div>
  );
};

export default TaxonomiesPage;
