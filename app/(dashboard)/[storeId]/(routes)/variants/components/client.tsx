"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";

import { columns, VariantColumn } from "./columns";

interface VariantsClientProps {
  data: VariantColumn[];
}

export const VariantsClient: React.FC<VariantsClientProps> = ({
  data
}) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Variants (${data.length})`}
          description="Manage product variants for your store"
        />
        <Button onClick={() => router.push(`/${params.storeId}/variants/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="sku" columns={columns} data={data} />
      <Heading title="API" description="API Calls for Variants" />
      <Separator />
      <ApiList entityName="variants" entityIdName="variantId" />
    </>
  );
}; 