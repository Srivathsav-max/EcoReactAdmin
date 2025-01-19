import prismadb from "@/lib/prismadb";
import { TaxonForm } from "./components/taxon-form";

const TaxonPage = async ({
  params
}: {
  params: { taxonId: string, storeId: string }
}) => {
  let taxon = null;

  if (params.taxonId !== "new") {
    taxon = await prismadb.taxon.findUnique({
      where: {
        id: params.taxonId
      },
      include: {
        parent: true,
        children: true,
        taxonomy: true
      }
    });
  }

  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: params.storeId
    }
  });

  const taxonomies = await prismadb.taxonomy.findMany({
    where: {
      storeId: params.storeId
    }
  });

  const availableTaxons = await prismadb.taxon.findMany({
    where: {
      taxonomy: {
        storeId: params.storeId
      },
      NOT: {
        id: params.taxonId
      }
    }
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <TaxonForm
          initialData={taxon}
          billboards={billboards}
          taxonomies={taxonomies}
          availableTaxons={availableTaxons}
        />
      </div>
    </div>
  );
}

export default TaxonPage;