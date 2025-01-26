"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import { AttributeValueColumn, columns } from "./columns";

interface AttributeValuesClientProps {
  data: AttributeValueColumn[];
}

export const AttributeValuesClient: React.FC<AttributeValuesClientProps> = ({
  data
}) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Attribute Values (${data.length})`}
          description="Manage attribute values for your store"
        />
        <Button onClick={() => router.push(`/${params.storeId}/attribute-values/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="value" columns={columns} data={data} />
      <Heading title="API" description="API calls for Attribute Values" />
      <Separator />
      <ApiList entityName="attribute-values" entityIdName="valueId" />
    </>
  );
}; 