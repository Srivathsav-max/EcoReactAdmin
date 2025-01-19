"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation"; // Add useParams import
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

interface TaxonomiesClientProps {
  data: {
    id: string;
    name: string;
    rootTaxon: string;
    createdAt: string;
  }[];
}

export const TaxonomiesClient: React.FC<TaxonomiesClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams(); // Add this line

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading 
          title={`Taxonomies (${data.length})`}
          description="Manage your store taxonomies"
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
