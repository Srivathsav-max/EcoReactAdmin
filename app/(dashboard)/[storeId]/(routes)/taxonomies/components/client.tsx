"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { columns, TaxonomyColumn } from "./columns";

interface TaxonomiesClientProps {
  data: {
    id: string;
    name: string;
    taxonsCount: number; // Changed from rootTaxon to taxonsCount
    createdAt: string;
  }[];
}

export const TaxonomiesClient: React.FC<TaxonomiesClientProps> = ({
  data
}) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading 
          title={`Taxonomies (${data.length})`}
          description="Manage taxonomies for your store"
        />
        <Button onClick={() => router.push(`/${params.storeId}/taxonomies/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
    </>
  );
};
