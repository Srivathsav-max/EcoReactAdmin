"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { TaxonTree } from "@/components/ui/taxon-tree";
import { Taxonomy } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TaxonsClientProps {
  taxonomies: (Taxonomy & {
    taxons: (Taxon & {
      children: Taxon[];
    })[];
  })[];
  products: any[];
}

export const TaxonsClient: React.FC<TaxonsClientProps> = ({
  taxonomies,
  products
}) => {
  const router = useRouter();
  const params = useParams();

  const handleTaxonSelect = (taxonId: string) => {
    router.push(`/${params.storeId}/taxons/${taxonId}`);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Taxonomy Structure"
          description="Manage your store's taxonomy hierarchy"
        />
        <Button onClick={() => router.push(`/${params.storeId}/taxons/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Taxon
        </Button>
      </div>
      <Separator />
      <div className="grid grid-cols-1 gap-4">
        {taxonomies.map((taxonomy) => (
          <Card key={taxonomy.id}>
            <CardHeader>
              <CardTitle>{taxonomy.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxonomy.taxons.map((taxon) => (
                  <TaxonTree
                    key={taxon.id}
                    taxon={taxon}
                    onSelect={(taxon) => handleTaxonSelect(taxon.id)}
                    products={products}
                  />
                ))}
                {taxonomy.taxons.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No taxons found in this taxonomy
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};
