"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";

import { columns, OptionValueColumn } from "./columns";

interface OptionValuesClientProps {
  data: OptionValueColumn[];
}

export const OptionValuesClient: React.FC<OptionValuesClientProps> = ({
  data
}) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Option Values (${data.length})`}
          description="Manage product option values"
        />
        <Button onClick={() => router.push(`/${params.storeId}/option-values/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="API calls for Option Values" />
      <Separator />
      <ApiList entityName="option-values" entityIdName="optionValueId" />
    </>
  );
}; 